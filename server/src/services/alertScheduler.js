import cron from 'node-cron';
import { fetchAsteroidData } from './nasaFetcher.js';
import Asteroid from '../models/Asteroid.js';
import User from '../models/User.js';
import { sendRiskAlert } from './emailService.js'; 

export const initScheduler = async () => {
  
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

 
  cron.schedule('0 */4 * * *', async () => {
    console.log('🔄 Cron: Refreshing Asteroid Data from NASA...');
    await fetchAsteroidData();
  });


  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Cron: Running Daily Risk Analysis...');
    
    try {
      const today = new Date().toISOString().split('T')[0];

       
      const hazardousAsteroids = await Asteroid.find({ 
        riskScore: { $gt: 1 }, 
        approachDate: today 
      });

      if (hazardousAsteroids.length === 0) {
        console.log('✅ No threats today. No emails sent.');
        return;
      }

      console.log(`⚠️ Found ${hazardousAsteroids.length} potential threats today.`);

    
      const users = await User.find({ 'alertPreferences.emailFrequency': { $ne: 'never' } });

     
      const currentDay = new Date().getDay();

      
      for (const user of users) {
        const { minRiskScore = 50, emailFrequency = 'daily', notifyImminent = true } = user.alertPreferences;
        
       
        if (emailFrequency === 'weekly' && currentDay !== 1) {
        
          if (!notifyImminent) {
            console.log(`⏭️  Skipping ${user.username} (Weekly schedule, not Monday)`);
            continue;
          }
        
        }

       
        const relevantThreat = hazardousAsteroids.find(ast => ast.riskScore >= minRiskScore);

       
        if (relevantThreat) {
          console.log(`⚡ Triggering alert for ${user.username} (Threshold: ${minRiskScore}, Frequency: ${emailFrequency})`);
          await sendRiskAlert(user.email, user.username, relevantThreat);
        } else if (notifyImminent && hazardousAsteroids.length > 0) {
         
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