import React, { useState, useEffect } from 'react';
import MediaUpload from '../shared/MediaUpload';
import '../auth/Modal.css';
import '../signup/SignUpModal.css';
import '../ads/Ads.css'; // Re-use form-row
import type { Vehicle } from '../../App';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVehicle: (vehicleData: any) => void;
  vehicleToEdit?: Vehicle | null;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onSaveVehicle, vehicleToEdit }) => {
  const [driverName, setDriverName] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [color, setColor] = useState('');
  const [model, setModel] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'متاح' | 'في العمل'>('متاح');

  const isEditMode = !!vehicleToEdit;
  const isFormValid = driverName.trim() !== '' && vehicleName.trim() !== '' && licensePlate.trim() !== '' && vehicleType.trim() !== '' && currentLocation.trim() !== '';

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setDriverName(vehicleToEdit.driverName);
        setVehicleName(vehicleToEdit.vehicleName);
        setLicensePlate(vehicleToEdit.licensePlate);
        setVehicleType(vehicleToEdit.vehicleType);
        setColor(vehicleToEdit.color);
        setModel(vehicleToEdit.model);
        setCurrentLocation(vehicleToEdit.currentLocation);
        setImageUrl(vehicleToEdit.imageUrl);
        setStatus(vehicleToEdit.status || 'متاح');
        setMediaFile(null); // Reset file on open
      } else {
        setDriverName('');
        setVehicleName('');
        setLicensePlate('');
        setVehicleType('');
        setColor('');
        setModel('');
        setCurrentLocation('');
        setImageUrl(null);
        setStatus('متاح');
        setMediaFile(null); // Reset file on open
      }
    }
  }, [isOpen, vehicleToEdit, isEditMode]);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    const vehicleData = {
        driverName,
        vehicleName,
        licensePlate,
        vehicleType,
        vehicleColor: color,
        vehicleModel: model,
        currentLocation,
        // Send the new base64 image if it exists, otherwise send the old URL.
        // The backend should handle `data:` urls as new uploads.
        imageUrl: imageUrl, 
        status,
    };
    onSaveVehicle(vehicleData);
  };
  
  const handleMediaUpload = (file: File | null) => {
    setMediaFile(file); // Keep the file object
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrl(reader.result as string); // Set the base64 preview
        };
        reader.readAsDataURL(file);
    } else {
        setImageUrl(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fullscreen-modal-content add-vehicle-modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleFormSubmit} id="add-vehicle-form" className="add-vehicle-form-wrapper">
            <header className="add-vehicle-modal-header">
                <button type="button" onClick={onClose} className="header-btn close" aria-label="إلغلاق">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2>{isEditMode ? 'تعديل مركبة' : 'إضافة مركبة جديدة'}</h2>
                <button type="submit" form="add-vehicle-form" className="header-btn save" disabled={!isFormValid} aria-label="حفظ">
                    حفظ
                </button>
            </header>
            <main className="fullscreen-modal-main">
                <div className="form-section-av">
                    <MediaUpload
                        mediaPreview={imageUrl}
                        setMediaPreview={setImageUrl}
                        onFileChange={handleMediaUpload}
                        accept="image/*"
                        uploadText="إضافة صورة للمركبة"
                        uploadSubText="(اختياري)"
                    />
                </div>
                
                <div className="form-section-av">
                    <h3 className="form-section-title-av">معلومات المركبة</h3>
                    <div className="input-group-av">
                        <label htmlFor="vehicleName">اسم المركبة</label>
                        <input id="vehicleName" type="text" name="vehicleName" placeholder="مثال: مرسيدس أكتروس" required value={vehicleName} onChange={e => setVehicleName(e.target.value)} />
                    </div>
                     <div className="form-row">
                        <div className="input-group-av">
                            <label htmlFor="vehicleType">نوع المركبة</label>
                            <input id="vehicleType" type="text" name="vehicleType" placeholder="مثال: تريلا، دينا" required value={vehicleType} onChange={e => setVehicleType(e.target.value)} />
                        </div>
                        <div className="input-group-av">
                            <label htmlFor="model">موديل المركبة</label>
                            <input id="model" type="text" name="model" placeholder="مثال: 2022" value={model} onChange={e => setModel(e.target.value)} />
                        </div>
                    </div>
                    <div className="input-group-av">
                        <label htmlFor="color">لون المركبة</label>
                        <input id="color" type="text" name="color" placeholder="مثال: أبيض" value={color} onChange={e => setColor(e.target.value)} />
                    </div>
                </div>

                <div className="form-section-av">
                    <h3 className="form-section-title-av">بيانات السائق واللوحة</h3>
                    <div className="input-group-av">
                        <label htmlFor="driverName">اسم السائق</label>
                        <input id="driverName" type="text" name="driverName" placeholder="الاسم الكامل للسائق" required value={driverName} onChange={e => setDriverName(e.target.value)} />
                    </div>
                    <div className="input-group-av">
                        <label htmlFor="licensePlate">رقم اللوحة</label>
                        <input id="licensePlate" type="text" name="licensePlate" placeholder="مثال: ١٢٣٤ أب ج" required value={licensePlate} onChange={e => setLicensePlate(e.target.value)} />
                    </div>
                </div>

                 <div className="form-section-av">
                    <h3 className="form-section-title-av">الموقع والحالة</h3>
                    <div className="input-group-av">
                        <label htmlFor="currentLocation">الموقع الحالي للمركبة</label>
                        <input id="currentLocation" type="text" name="currentLocation" placeholder="مثال: الرياض، حي الملز" required value={currentLocation} onChange={e => setCurrentLocation(e.target.value)} />
                    </div>
                    <div className="input-group-av">
                        <label>حالة المركبة</label>
                        <div className="status-segment-control">
                            <button type="button" className={status === 'متاح' ? 'active' : ''} onClick={() => setStatus('متاح')}>متاح</button>
                            <button type="button" className={status === 'في العمل' ? 'active' : ''} onClick={() => setStatus('في العمل')}>في العمل</button>
                        </div>
                    </div>
                </div>
            </main>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal;