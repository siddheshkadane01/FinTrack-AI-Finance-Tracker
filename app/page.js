import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  featuresData,
  howItWorksData,
} from "@/data/landing";
import Link from "next/link";
import { ArrowRight, TrendingUp, Shield, Users } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-32 min-h-screen overflow-hidden">
        {/* Background flowing shape */}
        <div className="absolute top-0 right-0 w-1/2 h-full">
          <svg
            viewBox="0 0 500 800"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#1E40AF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              d="M100,0 C150,100 200,200 250,300 C300,400 350,500 300,600 C250,700 200,800 100,800 L0,800 L0,0 Z"
              fill="url(#flowGradient)"
            />
            <path
              d="M200,0 C250,150 300,250 350,350 C400,450 450,550 400,650 C350,750 300,800 200,800 L100,800 C150,700 200,600 250,500 C300,400 250,300 200,200 C150,100 200,0 200,0 Z"
              fill="url(#flowGradient)"
              opacity="0.7"
            />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                We help you{" "}
                <span className="text-blue-600">maximise your</span>{" "}
                <span className="text-blue-700">financial potential</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                An AI-powered financial management platform that helps you track, analyze, and optimize your spending with real-time insights.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 group">
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-medium"
                >
                  Watch Demo
                </Button>
              </div>

              {/* Value Proposition */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">Why choose FinTrack?</p>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium text-gray-900">Smart Categorization</div>
                      <div className="text-sm text-gray-600">AI automatically categorizes your expenses and identifies spending patterns</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium text-gray-900">Receipt Scanning</div>
                      <div className="text-sm text-gray-600">Upload receipt photos and let AI extract transaction details instantly</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium text-gray-900">Budget Insights</div>
                      <div className="text-sm text-gray-600">Get personalized recommendations to optimize your financial goals</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Features Preview */}
              <div className="mt-8">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-3 py-2 rounded-full text-sm">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Bank-level Security</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-3 py-2 rounded-full text-sm">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">AI Insights</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-3 py-2 rounded-full text-sm">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-700">Real-time Sync</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Visual Element */}
            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Financial Dashboard</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Balance</span>
                      <span className="text-2xl font-bold text-green-600">₹45,230</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-blue-600 rounded-full w-3/4"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-blue-600">85%</div>
                        <div className="text-sm text-gray-500">Savings Goal</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">+12%</div>
                        <div className="text-sm text-gray-500">This Month</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-purple-600">24</div>
                        <div className="text-sm text-gray-500">Transactions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What we offer</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive financial tools designed to help you achieve your goals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuresData.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-gray-50 hover:bg-blue-50 rounded-2xl p-8 transition-all duration-300 group-hover:shadow-lg">
                  <div className="mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium group-hover:translate-x-1 transition-transform">
                    Learn more →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section with Stats */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-slate-900/50"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider">About us</h3>
                <h2 className="text-4xl font-bold leading-tight">
                  We simplify your money management
                </h2>
                <p className="text-lg text-blue-100 leading-relaxed">
                  FinTrack was built to make personal finance simple and accessible for everyone. 
                  Our AI-powered platform helps you track expenses, manage budgets, and gain 
                  insights into your spending habits — all designed with Indian users in mind.
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium">
                Get started
              </Button>
            </div>

            {/* Right Features */}
            <div className="space-y-8">
              <div className="text-right">
                <div className="text-sm text-blue-300 mb-2">Built for</div>
                <div className="text-5xl font-bold">India</div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-blue-300 mb-2">Launch year</div>
                <div className="text-5xl font-bold">2025</div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-blue-300 mb-2">AI-powered</div>
                <div className="text-5xl font-bold">Smart</div>
              </div>
              
              <div className="text-xs text-blue-200 text-right italic">
                &quot;Your money, simplified&quot;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Smart financial planning made simple</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your money and financial goals deserve a smart approach
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Process Steps */}
            <div className="space-y-12">
              {howItWorksData.map((step, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                      {index + 1}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {step.title.replace(/^\d+\.\s*/, '')}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="pt-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Available as a standalone service</h4>
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium">
                    Learn more →
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Image/Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold text-gray-900 mb-2">Investment Strategy</div>
                    <div className="text-gray-600">Personalized Portfolio</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Risk Level</span>
                      <span className="font-semibold text-orange-600">Moderate</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Expected Return</span>
                      <span className="font-semibold text-green-600">8.5% APY</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Diversification</span>
                      <span className="font-semibold text-blue-600">Global</span>
                    </div>
                    
                    <div className="pt-4 mt-4 border-t">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-blue-600">65%</div>
                          <div className="text-xs text-gray-500">Stocks</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">25%</div>
                          <div className="text-xs text-gray-500">Bonds</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-purple-600">10%</div>
                          <div className="text-xs text-gray-500">Alternative</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of users who are already managing their finances smarter with FinTrack. 
            Start your journey to financial freedom today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-2 group"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg"
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
