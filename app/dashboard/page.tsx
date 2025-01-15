'use client';
import Navbar from '../components/Dashboard/Navbar';
import TopNav from '../components/Dashboard/TopNav';
import DashboardContent from '../components/Dashboard/DashboardContent';
import { BiMoney } from 'react-icons/bi';
import { GiDiamonds } from 'react-icons/gi';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen z-50">
        <Navbar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-0"> 
        <TopNav />
        <main className="flex-1 mt-20">
          {/* Slider Section */}
          <div className="relative w-full overflow-hidden">
            <DashboardContent />
          </div>
          
          {/* Dashboard Content */}
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              {/* Stats Grid for Mobile */}
              <div className="grid grid-cols-2 gap-4 mb-6 lg:hidden">
                <div className="bg-black/40 backdrop-blur-lg border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <BiMoney className="text-xl" />
                    <span className="text-sm">Balance</span>
                  </div>
                  <span className="text-lg font-bold text-primary-light">$0</span>
                </div>
                <div className="bg-black/40 backdrop-blur-lg border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <GiDiamonds className="text-xl" />
                    <span className="text-sm">Diamonds</span>
                  </div>
                  <span className="text-lg font-bold text-primary-light">0</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-primary mb-8">Dashboard</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-black/40 backdrop-blur-lg border border-primary/20 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-primary mb-4">Recent Activity</h2>
                  <p className="text-primary-dark">No recent activity</p>
                </div>
                
                <div className="bg-black/40 backdrop-blur-lg border border-primary/20 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-primary mb-4">Popular Games</h2>
                  <p className="text-primary-dark">No games available</p>
                </div>
                
                <div className="bg-black/40 backdrop-blur-lg border border-primary/20 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-primary mb-4">Rewards</h2>
                  <p className="text-primary-dark">No rewards available</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
