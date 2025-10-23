import React from 'react';
import './FleetManagementScreen.css';
import type { Vehicle } from '../../App';

const VehicleCard: React.FC<{
  vehicle: Vehicle;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ vehicle, onEdit, onDelete }) => {
  const defaultImageUrl = `https://ui-avatars.com/api/?name=${(vehicle.vehicleName || 'T').charAt(0)}&background=bdc3c7&color=fff&size=128`;
  const statusClass = vehicle.status === 'في العمل' ? 'busy' : 'available';

  return (
    <div className="vehicle-card-fm">
      <div className="vehicle-card-fm-image-wrapper">
        <img src={vehicle.imageUrl || defaultImageUrl} alt={vehicle.vehicleName} className="vehicle-card-fm-image" />
        <span className={`vehicle-card-fm-status ${statusClass}`}>
          {vehicle.status || 'متاح'}
        </span>
      </div>
      <div className="vehicle-card-fm-body">
         <div className="vehicle-card-fm-header">
            <h3>{vehicle.vehicleName}</h3>
            <p>{vehicle.licensePlate}</p>
        </div>
        <div className="vehicle-card-fm-actions">
            <button className="card-action-btn edit" onClick={onEdit} aria-label="تعديل">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg>
            </button>
            <button className="card-action-btn delete" onClick={onDelete} aria-label="حذف">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
            </button>
        </div>
      </div>
    </div>
  );
};


const FleetManagementScreen: React.FC<{
  className?: string;
  onNavigateBack: () => void;
  fleet: Vehicle[];
  onOpenAddVehicleModal: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (vehicleId: string) => void;
}> = ({ className, onNavigateBack, fleet, onOpenAddVehicleModal, onEditVehicle, onDeleteVehicle }) => {
  return (
    <div className={`app-container fleet-management-container ${className || ''}`}>
      <header className="fleet-header-redesigned">
        <button onClick={onNavigateBack} className="header-btn-fm back" aria-label="الرجوع">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <h1>إدارة الأسطول</h1>
        <button className="header-btn-fm add" onClick={onOpenAddVehicleModal}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>إضافة</span>
        </button>
      </header>
      <main className="app-content fleet-content-redesigned">
        {fleet.length > 0 ? (
          <div className="fleet-list-redesigned">
            {fleet.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onEdit={() => onEditVehicle(vehicle)}
                onDelete={() => onDeleteVehicle(vehicle.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-fleet-fm">
            <svg className="empty-fleet-fm-icon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              <path d="M56 22h-4v-2c0-4.4-3.6-8-8-8h-8c-4.4 0-8 3.6-8 8v2h-4c-2.2 0-4 1.8-4 4v14c0 2.2 1.8 4 4 4h.2c.9 2.3 3.1 4 5.8 4s4.9-1.7 5.8-4h10.4c.9 2.3 3.1 4 5.8 4s4.9-1.7 5.8-4H56c2.2 0 4-1.8 4-4V26c0-2.2-1.8-4-4-4zM32 18h8c2.2 0 4 1.8 4 4v2H28v-2c0-2.2 1.8-4 4-4zM24 42c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm20 0c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
            </svg>
            <h3>أسطولك فارغ حالياً</h3>
            <p>ابدأ بإضافة مركباتك لعرضها وإدارتها بكل سهولة.</p>
             <button className="add-first-vehicle-btn" onClick={onOpenAddVehicleModal}>
                إضافة أول مركبة
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default FleetManagementScreen;