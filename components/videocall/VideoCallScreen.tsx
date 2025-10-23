import React, { useState, useEffect, useRef } from 'react';
import type { MediaConnection } from 'peerjs';
import { peerManager } from '../../utils/audioCall';
import type { CallRequest } from '../../App';
import { API_BASE_URL } from '../../config';
import './VideoCallScreen.css';

interface VideoCallScreenProps {
  className?: string;
  callRequest: CallRequest | null;
  onEndCall: () => void;
}

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({ className, callRequest, onEndCall }) => {
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const isActive = className?.includes('page-active');
  const peerData = callRequest?.peerData;

  const cleanupCall = () => {
    if (callRef.current) {
      callRef.current.close();
      callRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setCallStatus('connecting');
    setCallDuration(0);
  };

  useEffect(() => {
    if (!isActive || !callRequest) {
      if (callRef.current || localStreamRef.current) {
        cleanupCall();
      }
      return;
    }

    const peer = peerManager.peer;
    if (!peer) {
      console.error("PeerJS not initialized.");
      onEndCall();
      return;
    }

    const setupCall = (call: MediaConnection) => {
      callRef.current = call;
      setCallStatus('connecting');

      call.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(e => console.error("Error playing remote video:", e));
        }
        setCallStatus('connected');
      });

      call.on('close', onEndCall);
      call.on('error', (err) => {
        console.error('PeerJS call error:', err);
        onEndCall();
      });
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        if (callRequest.type === 'outgoing') {
          const outgoingCall = peer.call(callRequest.peerData._id, stream, { 
            metadata: { type: 'video', callLogId: callRequest.callLogId } 
          });
          setupCall(outgoingCall);
        } else if (callRequest.type === 'incoming' && callRequest.callObject) {
          callRequest.callObject.answer(stream);
          setupCall(callRequest.callObject);
        }
      })
      .catch(err => {
        console.error('Failed to get local stream', err);
        alert('فشل الوصول إلى الكاميرا/الميكروفون. يرجى التحقق من الأذونات.');
        onEndCall();
      });

    return cleanupCall;
  }, [isActive, callRequest, onEndCall]);

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
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(prev => !prev);
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(prev => !prev);
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

  if (!peerData) return null;

  return (
    <div className={`app-container video-call-container ${className || ''}`}>
      <video ref={remoteVideoRef} className="remote-video" autoPlay playsInline />
      <div className="pip-view">
        <video ref={localVideoRef} className="local-video" autoPlay playsInline muted />
      </div>

      <header className="video-call-header">
        <div className="caller-info-top">
          <h3>{peerData.name}</h3>
          <p>{callStatus === 'connected' ? formatTime(callDuration) : 'جارٍ الاتصال...'}</p>
        </div>
      </header>

      <footer className="video-controls-footer">
        <button className={`video-control-btn ${isMuted ? 'active' : ''}`} onClick={toggleMute} aria-label={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <g opacity={isMuted ? 0.5 : 1}>
                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.75 6.75 0 11-13.5 0v-1.5A.75.75 0 016 10.5z" />
            </g>
            {isMuted && <path className="slash" d="M3.29 4.71a1 1 0 00-1.42 1.42l18 18a1 1 0 001.42-1.42L3.29 4.71z" />}
          </svg>
        </button>
        <button className={`video-control-btn ${isCameraOff ? 'active' : ''}`} onClick={toggleCamera} aria-label={isCameraOff ? "تشغيل الكاميرا" : "إيقاف الكاميرا"}>
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
              {isCameraOff && <path className="slash" d="M3.29 4.71a1 1 0 00-1.42 1.42l18 18a1 1 0 001.42-1.42L3.29 4.71z" />}
            </svg>
        </button>
        <button className="video-control-btn" disabled aria-label="تبديل الكاميرا">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348L21 14.325l-4.977 4.977M21 14.325H3M7.977 4.675L3 9.652l4.977 4.977M3 9.652h18" />
           </svg>
        </button>
        <button className="video-control-btn end-call-btn" onClick={handleEndCall} aria-label="إنهاء المكالمة">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
           </svg>
        </button>
      </footer>
    </div>
  );
};

export default VideoCallScreen;