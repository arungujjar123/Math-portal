import { connectToDatabase } from './mongodb';
import User from '@/models/User';
import Slide from '@/models/Slide';
import Doubt from '@/models/Doubt';

export async function ensureDatabaseSeeded() {
  // Pure database connection check without inserting any mock/test data!
  await connectToDatabase();
}

export async function clearDatabaseForProduction() {
  await connectToDatabase();
  await User.deleteMany({});
  await Slide.deleteMany({});
  await Doubt.deleteMany({});
}
