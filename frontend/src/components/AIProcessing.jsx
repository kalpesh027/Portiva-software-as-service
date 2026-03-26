import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortfolioService from '../services/portfolioService';
import { useDispatch } from 'react-redux';
import { completePortfolio } from '../features/portfolio/portfolioSlice';

const AIProcessing = () => {
    const [progress, setProgress] = useState(0);
    const [dots, setDots] = useState('');
    const dark = localStorage.getItem('portify-theme') !== 'light';
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        // Poll for backend portfolio generation status
        const pollInterval = setInterval(async () => {
            try {
                const res = await PortfolioService.getMyPortfolio();
                if (res?.portfolio?.status === 'published') {
                    clearInterval(pollInterval);
                    setProgress(100);
                    dispatch(completePortfolio(res.portfolio));
                    setTimeout(() => {
                        navigate('/portfolio-success');
                    }, 500);
                }
            } catch (err) {
                // Keep polling unless an auth error
                console.log("Polling...");
            }
        }, 3000);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev;
                return prev + Math.random() * 8;
            });
        }, 400);

        const dotsInterval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);

        return () => {
            clearInterval(pollInterval);
            clearInterval(progressInterval);
            clearInterval(dotsInterval);
        };
    }, []);

    return (
        <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-[#080e1a]' : 'bg-slate-50'}`}>
            <div className="text-center max-w-md px-8">
                {/* Circle with Percentage and Pulsing Rings */}
                <div className="flex justify-center mb-12">
                    <div className="relative">
                        {/* Main circle */}
                        <div className="w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-600 to-violet-400 shadow-lg shadow-violet-500/40">
                            <div className="text-white font-bold text-3xl">
                                {Math.round(progress)}%
                            </div>
                        </div>

                        {/* Animated rings */}
                        <div className="absolute inset-0 rounded-full border-2 border-violet-500 animate-ping opacity-60"></div>
                        <div className="absolute -inset-2 rounded-full border-2 border-violet-400 opacity-30 animate-pulse"></div>
                    </div>
                </div>

                {/* Text */}
                <h2 className={`text-3xl font-bold mb-3 ${dark ? 'text-white' : 'text-slate-900'}`}>
                    Building Your Portfolio
                </h2>

                {/* Progress bar */}
                <div className={`w-full h-1.5 rounded-full mb-4 ${dark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>

                <p className={`text-lg ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    AI is crafting your perfect website{dots}
                </p>
            </div>
        </div>
    );
};

export default AIProcessing;
