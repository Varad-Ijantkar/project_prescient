import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { BarChart, Users, Brain, Shield, TrendingUp, MessageCircle, Menu, X, ChevronRight } from 'lucide-react';
import { Link } from "react-router-dom";
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import { Engine } from "tsparticles-engine"; // Already imported correctly

const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Header scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // ParticleJS initialization with explicit Engine type
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    const particlesOptions = {
        background: {
            opacity: 0,
        },
        particles: {
            number: {
                value: 100, // Increase particle count for more activity
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#ffffff"
            },
            shape: {
                type: "circle", // You can try "triangle", "square", or "polygon" for variety
            },
            opacity: {
                value: 0.7,
                random: true,
                anim: {
                    enable: true, // Enable opacity animation
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 4,
                random: true,
                anim: {
                    enable: true, // Enable size animation
                    speed: 2,
                    size_min: 1,
                    sync: false
                }
            },
            move: {
                enable: true,
                speed: 2, // Increase speed for more dynamic movement
                direction: "none",
                random: true,
                straight: false,
                outMode: "bounce", // Change to "bounce" for particles to bounce off edges
                bounce: true,
                attract: {
                    enable: true, // Add particle attraction for interactivity
                    distance: 200
                }
            },
            links: {
                enable: true,
                distance: 150,
                color: "#ffffff",
                opacity: 0.5,
                width: 1,
                hover: {
                    enable: true, // Enhance links on hover
                    mode: "grab"
                }
            }
        },
        interactivity: {
            detectsOn: "window",
            events: {
                onClick: {
                    enable: true,
                    mode: "push" // Or "repulse" for particles to move away on click
                },
                onHover: {
                    enable: true,
                    mode: "grab", // Or "bubble" for a larger effect
                    parallax: {
                        enable: true, // Add parallax effect on hover
                        force: 60
                    }
                },
                resize: true
            },
            modes: {
                push: {
                    quantity: 6
                },
                grab: {
                    distance: 200,
                    links: {
                        opacity: 1
                    }
                },
                bubble: {
                    distance: 250,
                    size: 10,
                    duration: 2
                },
                repulse: {
                    distance: 150,
                    duration: 0.4
                }
            }
        },
        detectRetina: true
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
            {/* Enhanced Header/Navigation with smooth transition */}
            <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
            }`}>
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center group">
                            <Brain className="h-8 w-8 text-blue-600 transform group-hover:rotate-12 transition-transform"/>
                            <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                AttritionAI
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <a href="#solutions" className="text-gray-600 hover:text-blue-600 transition-colors">Solutions</a>
                            <a href="#resources" className="text-gray-600 hover:text-blue-600 transition-colors">Resources</a>
                            <button className="text-gray-600 hover:text-blue-600 transition-colors">Request Demo</button>
                            <Link to="/signup"><button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all">
                                Sign Up
                            </button></Link>
                            <Link to="/login"><button className="border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                                Login
                            </button></Link>
                        </nav>

                        {/* Mobile Menu Button with animation */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                        </button>
                    </div>

                    {/* Enhanced Mobile Navigation with smooth transition */}
                    <div className={`md:hidden overflow-hidden transition-all duration-300 ${
                        isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                        <div className="py-4 space-y-4">
                            <a href="#solutions" className="block py-2 text-gray-600 hover:text-blue-600 transition-colors">Solutions</a>
                            <a href="#resources" className="block py-2 text-gray-600 hover:text-blue-600 transition-colors">Resources</a>
                            <button className="block py-2 text-gray-600 hover:text-blue-600 transition-colors w-full text-left">Request Demo</button>
                            <button className="block w-full bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors">
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="pt-20">
                {/* Enhanced Hero Section with Particles effect */}
                <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
                    {/* Particles Background */}
                    <div className="absolute inset-0">
                        <Particles
                            id="tsparticles"
                            init={particlesInit}
                            options={{
                                background: {
                                    opacity: 0,
                                },
                                particles: {
                                    number: {
                                        value: 80,
                                        density: {
                                            enable: true,
                                            value_area: 800
                                        }
                                    },
                                    color: {
                                        value: "#ffffff"
                                    },
                                    shape: {
                                        type: "circle",
                                    },
                                    opacity: {
                                        value: 0.5,
                                        random: true
                                    },
                                    size: {
                                        value: 3,
                                        random: true
                                    },
                                    move: {
                                        enable: true,
                                        speed: 1,
                                        direction: "none",
                                        random: true,
                                        straight: false,
                                        out_mode: "out",
                                        bounce: false,
                                    },
                                    links: {
                                        enable: true,
                                        distance: 150,
                                        color: "#ffffff",
                                        opacity: 0.4,
                                        width: 1
                                    }
                                },
                                interactivity: {
                                    detect_on: "canvas",
                                    events: {
                                        onHover: {
                                            enable: true,
                                            mode: "grab"
                                        },
                                        onclick: {
                                            enable: true,
                                            mode: "push"
                                        },
                                        resize: true
                                    },
                                    modes: {
                                        grab: {
                                            distance: 140,
                                            line_linked: {
                                                opacity: 1
                                            }
                                        },
                                        push: {
                                            particles_nb: 4
                                        }
                                    }
                                },
                                retina_detect: true
                            }}
                        />
                    </div>

                    <div className="relative max-w-6xl mx-auto px-4 py-32">
                        <h1 className="text-6xl font-bold mb-6 leading-tight">
                            Transform Your <span className="text-blue-200">Employee Retention</span> Strategy
                        </h1>
                        <p className="text-xl mb-8 max-w-2xl text-blue-100">
                            Harness the power of AI and sentiment analysis to predict, understand, and prevent employee turnover
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="group bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center backdrop-blur-sm">
                                Get Started
                                <ChevronRight className="ml-2 transform group-hover:translate-x-1 transition-transform"/>
                            </button>
                            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 hover:backdrop-blur-sm transition-all transform hover:scale-105">
                                Watch Demo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Highlight Section - NEW */}
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="bg-white rounded-xl shadow-xl p-8 -mt-16 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <h3 className="text-4xl font-bold text-blue-600 mb-2">86%</h3>
                            <p className="text-gray-600">Improved retention rate for clients</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-4xl font-bold text-blue-600 mb-2">3.2x</h3>
                            <p className="text-gray-600">Return on investment</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-4xl font-bold text-blue-600 mb-2">$4.3M</h3>
                            <p className="text-gray-600">Average annual savings</p>
                        </div>
                    </div>
                </div>

                {/* Enhanced Key Features Section */}
                <div id="solutions" className="max-w-6xl mx-auto px-4 py-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Our AI-Powered Solutions</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Discover how our platform transforms employee retention through advanced AI technology</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-t-blue-600 bg-white">
                            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                                <Brain className="h-8 w-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl mb-4">Sentiment Analysis</CardTitle>
                            <p className="text-gray-600 leading-relaxed">
                                Advanced LLM models analyze employee feedback, communications, and surveys to gauge satisfaction levels
                            </p>
                        </Card>

                        <Card className="p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-t-blue-600 bg-white">
                            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                                <TrendingUp className="h-8 w-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl mb-4">Predictive Analytics</CardTitle>
                            <p className="text-gray-600 leading-relaxed">
                                Early warning system identifies attrition risks before they lead to turnover
                            </p>
                        </Card>

                        <Card className="p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-t-blue-600 bg-white">
                            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                                <Shield className="h-8 w-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl mb-4">Privacy-First</CardTitle>
                            <p className="text-gray-600 leading-relaxed">
                                Enterprise-grade security with encrypted data processing and anonymized insights
                            </p>
                        </Card>
                    </div>
                </div>

                {/* How It Works Section - NEW */}
                <div className="bg-blue-50 py-24">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold mb-4">How AttritionAI Works</h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Our AI-powered platform transforms your retention strategy in three simple steps</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-xl shadow-md relative">
                                <div className="absolute -top-6 -left-6 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">1</div>
                                <h3 className="text-xl font-bold mb-4 mt-4">Data Collection</h3>
                                <p className="text-gray-600">We securely integrate with your existing HR systems and communication platforms</p>
                            </div>

                            <div className="bg-white p-8 rounded-xl shadow-md relative">
                                <div className="absolute -top-6 -left-6 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">2</div>
                                <h3 className="text-xl font-bold mb-4 mt-4">AI Analysis</h3>
                                <p className="text-gray-600">Our algorithms analyze patterns and identify early warning signs of potential turnover</p>
                            </div>

                            <div className="bg-white p-8 rounded-xl shadow-md relative">
                                <div className="absolute -top-6 -left-6 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">3</div>
                                <h3 className="text-xl font-bold mb-4 mt-4">Actionable Insights</h3>
                                <p className="text-gray-600">Receive personalized recommendations to improve retention and employee satisfaction</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section - NEW */}
                <div className="max-w-6xl mx-auto px-4 py-24">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 relative overflow-hidden">
                        {/* Particles Background for CTA */}
                        <div className="absolute inset-0">
                            <Particles
                                id="tsparticles-cta"
                                init={particlesInit}
                                options={{
                                    background: {
                                        opacity: 0,
                                    },
                                    particles: {
                                        number: {
                                            value: 40,
                                            density: {
                                                enable: true,
                                                value_area: 800
                                            }
                                        },
                                        color: {
                                            value: "#ffffff"
                                        },
                                        shape: {
                                            type: "circle",
                                        },
                                        opacity: {
                                            value: 0.3,
                                            random: true
                                        },
                                        size: {
                                            value: 2,
                                            random: true
                                        },
                                        move: {
                                            enable: true,
                                            speed: 0.5,
                                            direction: "top",
                                            random: true,
                                            straight: false,
                                            out_mode: "out",
                                            bounce: false,
                                        }
                                    },
                                    interactivity: {
                                        detect_on: "canvas",
                                        events: {
                                            onHover: {
                                                enable: true,
                                                mode: "repulse"
                                            },
                                            resize: true
                                        }
                                    },
                                    retina_detect: true
                                }}
                            />
                        </div>

                        <div className="relative z-10 text-center text-white">
                            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Retention Strategy?</h2>
                            <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">Join over 500 companies that have reduced attrition by an average of 32% in the first year</p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105">
                                    Request a Demo
                                </button>
                                <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all transform hover:scale-105">
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Footer */}
                <footer id="resources" className="bg-gray-900 text-white py-24">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="grid md:grid-cols-4 gap-12">
                            <div>
                                <div className="flex items-center mb-6 group">
                                    <Brain className="h-8 w-8 text-blue-400 transform group-hover:rotate-12 transition-transform" />
                                    <span className="ml-2 text-2xl font-bold">AttritionAI</span>
                                </div>
                                <p className="text-gray-400 leading-relaxed">
                                    Transforming employee retention through AI-powered insights
                                </p>
                                <div className="mt-6 flex space-x-4">
                                    <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                                        </svg>
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                                        </svg>
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                                        </svg>
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-xl mb-6">Solutions</h3>
                                <ul className="space-y-4 text-gray-400">
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Sentiment Analysis</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Predictive Analytics</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">HR Dashboard</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Integration API</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-xl mb-6">Resources</h3>
                                <ul className="space-y-4 text-gray-400">
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Documentation</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Case Studies</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Blog</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Webinars</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-xl mb-6">Company</h3>
                                <ul className="space-y-4 text-gray-400">
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">About Us</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Careers</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Contact</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-400">
                            <p>© 2025 AttritionAI. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;