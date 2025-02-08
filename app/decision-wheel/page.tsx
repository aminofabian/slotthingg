import { Metadata } from 'next';
import DecisionWheel from '../components/Roulette/DecisionWheel';

export const metadata: Metadata = {
  title: 'Decision Wheel | Make Quick Decisions',
  description: 'Use our interactive decision wheel to make quick yes/no decisions or choose between multiple custom options.',
};

export default function DecisionWheelPage() {
  return <DecisionWheel />;
} 