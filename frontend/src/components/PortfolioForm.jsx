import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Stepper from './Stepper';
import PersonalInfo from './form/PersonalInfo';
import SkillsForm from './form/SkillsForm';
import ExperienceForm from './form/ExperienceForm';
import ProjectForm from './form/ProjectForm';
import EducationForm from './form/EducationForm';
import TestimonialsForm from './form/TestimonialsForm';
import ContactForm from './form/ContactForm';

const PortfolioForm = () => {
  const { currentStep, isGenerated } = useSelector((state) => state.portfolio);
  const navigate = useNavigate();

  useEffect(() => {
    if (isGenerated) {
      navigate('/dashboard');
    }
  }, [isGenerated, navigate]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfo />;
      case 2:
        return <SkillsForm />;
      case 3:
        return <ExperienceForm />;
      case 4:
        return <ProjectForm />;
      case 5:
        return <EducationForm />;
      case 6:
        return <TestimonialsForm />;
      case 7:
        return <ContactForm />;
      default:
        return <PersonalInfo />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar Stepper */}
      <Stepper />
      
      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
             {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default PortfolioForm;
