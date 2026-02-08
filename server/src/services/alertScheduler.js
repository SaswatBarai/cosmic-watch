import cron from 'node-cron';
import { fetchAsteroidData } from './nasaFetcher.js';
import Asteroid from '../models/Asteroid.js';
import User from '../models/User.js'; // Import User model
import { sendRiskAlert } from './emailService.js'; // Import Email Service

export const initScheduler = async () => {
  // Fetch data immediately on startup so a fresh DB isn't empty
  try {
    const count = await Asteroid.countDocuments();
    if (count === 0) {
      console.log('📡 Empty database detected – fetching initial data from NASA...');
      await fetchAsteroidData();
    } else {
      console.log(`✅ Database already has ${count} asteroids. Skipping initial fetch.`);
    }
  } catch (err) {
    console.error('⚠️ Initial NASA fetch failed:', err.message);
  }

  // Task 1: Data Refresh (Every 4 hours)
  cron.schedule('0 */4 * * *', async () => {
    console.log('🔄 Cron: Refreshing Asteroid Data from NASA...');
    await fetchAsteroidData();
  });

  // Task 2: Daily Risk Alert (Runs every day at 09:00 AM)
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Cron: Running Daily Risk Analysis...');
    
    try {
      const today = new Date().toISOString().split('T')[0];

      // 1. Find Critical Asteroids for TODAY
      const hazardousAsteroids = await Asteroid.find({ 
        riskScore: { $gt: 1 }, // Fetch anything with risk > 1 to filter later
        approachDate: today 
      });

      if (hazardousAsteroids.length === 0) {
        console.log('✅ No threats today. No emails sent.');
        return;
      }

      console.log(`⚠️ Found ${hazardousAsteroids.length} potential threats today.`);

      // 2. Fetch Users with "Daily" or "Weekly" preferences (exclude "never")
      const users = await User.find({ 'alertPreferences.emailFrequency': { $ne: 'never' } });

      // Get current day for Weekly check (0 = Sunday, 1 = Monday, etc.)
      const currentDay = new Date().getDay();

      // 3. Match Asteroids to Users based on Risk Score and Preferences
      for (const user of users) {
        const { minRiskScore = 50, emailFrequency = 'daily', notifyImminent = true } = user.alertPreferences;
        
        // FIX 1: Skip "Weekly" users if it's not Monday (unless notifyImminent is true for critical threats)
        if (emailFrequency === 'weekly' && currentDay !== 1) {
          // If notifyImminent is enabled, check if there are critical threats anyway
          if (!notifyImminent) {
            console.log(`⏭️  Skipping ${user.username} (Weekly schedule, not Monday)`);
            continue;
          }
          // If notifyImminent is true, we'll check for critical threats below
        }

        // Find the highest risk asteroid that exceeds user's threshold
        const relevantThreat = hazardousAsteroids.find(ast => ast.riskScore >= minRiskScore);

        // FIX 2: Send alert if threat exceeds threshold OR if notifyImminent is enabled for any approaching asteroid
        if (relevantThreat) {
          console.log(`⚡ Triggering alert for ${user.username} (Threshold: ${minRiskScore}, Frequency: ${emailFrequency})`);
          await sendRiskAlert(user.email, user.username, relevantThreat);
        } else if (notifyImminent && hazardousAsteroids.length > 0) {
          // If notifyImminent is true but no asteroid meets the threshold, 
          // still notify about the highest risk asteroid approaching today
          const highestRisk = hazardousAsteroids.reduce((prev, curr) => 
            curr.riskScore > prev.riskScore ? curr : prev
          );
          console.log(`⚡ Triggering imminent alert for ${user.username} (Highest Risk: ${highestRisk.riskScore})`);
          await sendRiskAlert(user.email, user.username, highestRisk);
        }
      }

    } catch (err) {
      console.error('❌ Alert Check Failed:', err.message);
    }
  });
};