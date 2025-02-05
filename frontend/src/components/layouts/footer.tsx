import React from "react";
import { Brain } from "lucide-react";

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center mb-4">
                            <Brain className="h-8 w-8 text-blue-400" />
                            <span className="ml-2 text-xl font-bold">AttritionAI</span>
                        </div>
                        <p className="text-gray-400">
                            Transforming employee retention through AI-powered insights
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Solutions</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Sentiment Analysis</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Predictive Analytics</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">HR Dashboard</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Resources</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Documentation</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Case Studies</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Blog</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Company</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">About Us</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Careers</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Contact</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-6 text-center">
                    <p className="text-gray-400">© 2025 AttritionAI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
