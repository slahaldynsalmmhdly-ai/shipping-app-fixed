import React, { useState, useEffect, useRef } from 'react';
import type { MediaConnection } from 'peerjs';
import { peerManager } from '../../utils/audioCall';
import type { CallRequest } from '../../App';
import { API_BASE_URL } from '../../config';
import './VoiceCallScreen.css';

interface VoiceCallScreenProps {
  className?: string;
  callRequest: CallRequest | null;
  onEndCall: () => void;
}

const VoiceCallScreen: React.FC<VoiceCallScreenProps> = ({ className, callRequest, onEndCall }) => {
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const callRef = useRef<MediaConnection | null>(null);

  const isActive = className?.includes('page-active');
  const user = callRequest?.peerData;

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (callRef.current) {
        callRef.current.close();
        callRef.current = null;
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    };
  }, []);

  // Main call logic effect
  useEffect(() => {
    if (!isActive || !callRequest) {
      return;
    }

    const peer = peerManager.peer;
    if (!peer) {
      console.error("PeerJS not initialized.");
      onEndCall();
      return;
    }

    let streamInstance: MediaStream;

    const setupCall = (call: MediaConnection) => {
      callRef.current = call;
      setCallStatus('connecting');

      call.on('stream', (remoteStream) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.play();
        }
        setCallStatus('connected');
      });

      call.on('close', () => {
        onEndCall();
      });

      call.on('error', (err) => {
        console.error('PeerJS call error:', err);
        onEndCall();
      });
    };

    navigator.mediaDevices.getUserMedia({ video: false, audio: true })
      .then(stream => {
        setLocalStream(stream);
        streamInstance = stream;

        if (callRequest.type === 'outgoing') {
          const outgoingCall = peer.call(callRequest.peerData._id, stream, {
            metadata: { type: 'audio', callLogId: callRequest.callLogId }
          });
          setupCall(outgoingCall);
        } else if (callRequest.type === 'incoming' && callRequest.callObject) {
          callRequest.callObject.answer(stream);
          setupCall(callRequest.callObject);
        }
      })
      .catch(err => {
        console.error('Failed to get local stream', err);
        alert('Failed to access microphone. Please check permissions.');
        onEndCall();
      });

    return () => {
      callRef.current?.close();
      callRef.current = null;
      streamInstance?.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    };
  }, [isActive, callRequest, onEndCall]);

  // Timer effect
  useEffect(() => {
    let interval: number | undefined;
    if (isActive && callStatus === 'connected') {
      interval = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, callStatus]);

  // Effect to update status to answered
  useEffect(() => {
      if (callStatus === 'connected' && callRequest?.callLogId) {
          const token = localStorage.getItem('authToken');
          if (!token) return;
          
          fetch(`${API_BASE_URL}/api/v1/call-logs/${callRequest.callLogId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ status: 'answered' })
          }).catch(e => console.error("Failed to update call log to answered:", e));
      }
  }, [callStatus, callRequest?.callLogId]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(prev => !prev);
    }
  };

  const handleEndCall = async () => {
    if (callRequest?.callLogId) {
        const token = localStorage.getItem('authToken');
        if (token) {
            let finalStatus = 'completed';
            if (callStatus === 'connecting') {
                finalStatus = callRequest.type === 'outgoing' ? 'cancelled' : 'missed';
            }
            
            try {
                await fetch(`${API_BASE_URL}/api/v1/call-logs/${callRequest.callLogId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        status: finalStatus,
                        duration: callDuration,
                        endedAt: new Date()
                    })
                });
            } catch (error) {
                console.error('Failed to update call log on end:', error);
            }
        }
    }
    onEndCall();
  };

  if (!user) return null;

  return (
    <div className={`app-container voice-call-container ${className || ''}`}>
      <audio ref={remoteAudioRef} autoPlay />
      <main className="app-content voice-call-content">
        <div className="caller-info">
          <div className="avatar-animation-wrapper">
            <div className="pulse-ring"></div>
            <div className="pulse-ring delay-1"></div>
            <div className="pulse-ring delay-2"></div>
            <img src={user.avatarUrl} alt={user.name} className="caller-avatar" />
          </div>
          <h1 className="caller-name">{user.name}</h1>
          <p className="call-status">
            {callStatus === 'connected' ? formatTime(callDuration) : 'جارٍ الاتصال...'}
          </p>
        </div>

        <div className="call-controls">
          <button className={`control-btn ${isMuted ? 'active' : ''}`} onClick={toggleMute} aria-label={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <g opacity={isMuted ? 0.5 : 1}>
                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.75 6.75 0 11-13.5 0v-1.5A.75.75 0 016 10.5z" />
              </g>
              {isMuted && <path className="slash" d="M3.29 4.71a1 1 0 00-1.42 1.42l16 16a1 1 0 001.42-1.42L3.29 4.71z" />}
            </svg>
          </button>
          <button className='control-btn' disabled>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
               <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
             </svg>
          </button>
           <button className='control-btn' disabled>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
            </svg>
          </button>
          <button className="control-btn end-call-btn" onClick={handleEndCall} aria-label="إنهاء المكالمة">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
               <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
             </svg>
          </button>
        </div>
      </main>
    </div>
  );
};

export default VoiceCallScreen;