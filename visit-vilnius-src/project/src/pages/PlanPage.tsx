import React from 'react';
import { useNavigate } from 'react-router-dom';
import TripPlannerModal from '../components/TripPlannerModal';

const PlanPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <TripPlannerModal isOpen={true} onClose={handleClose} />
    </div>
  );
};

export default PlanPage;
