export const MINING_SESSION_DURATION = 8 * 60 * 60 * 1000; 
    export const BASE_MINING_AMOUNT_PER_SESSION = 10; 

    export const SPEED_UPGRADES = [
      { id: 'speed1', multiplier: 2, costTon: 0.2, labelKey: "miningPage.upgradesModal.speed.level1", icon: true },
      { id: 'speed2', multiplier: 5, costTon: 0.5, labelKey: "miningPage.upgradesModal.speed.level2", icon: true },
      { id: 'speed3', multiplier: 10, costTon: 1, labelKey: "miningPage.upgradesModal.speed.level3", icon: true },
      { id: 'speed4', multiplier: 25, costTon: 2.5, labelKey: "miningPage.upgradesModal.speed.level4", icon: true },
      { id: 'speed5', multiplier: 50, costTon: 5, labelKey: "miningPage.upgradesModal.speed.level5", icon: true },
      { id: 'speed6', multiplier: 120, costTon: 10, labelKey: "miningPage.upgradesModal.speed.level6", icon: true },
    ];

    export const AUTO_MINING_UPGRADES = [
      { id: 'auto1', durationDays: 3, costTon: 0.5, labelKey: "miningPage.upgradesModal.autoMining.3days", icon: true },
      { id: 'auto2', durationDays: 7, costTon: 1, labelKey: "miningPage.upgradesModal.autoMining.7days", icon: true },
      { id: 'auto3', durationDays: 30, costTon: 3.5, labelKey: "miningPage.upgradesModal.autoMining.30days", icon: true },
    ];
    
    export const BACKGROUND_UPGRADES = [
      { id: 'bg1', labelKey: 'miningPage.backgrounds.cosmicPurple.name', descriptionKey: 'miningPage.backgrounds.cosmicPurple.description', costTon: 0.5, className: 'theme-cosmic-purple', icon: true },
      { id: 'bg2', labelKey: 'miningPage.backgrounds.cyberGrid.name', descriptionKey: 'miningPage.backgrounds.cyberGrid.description', costTon: 0.5, className: 'theme-cyber-grid', icon: true },
      { id: 'bg3', labelKey: 'miningPage.backgrounds.goldenNebula.name', descriptionKey: 'miningPage.backgrounds.goldenNebula.description', costTon: 0.5, className: 'theme-golden-nebula', icon: true },
      { id: 'bg4', labelKey: 'miningPage.backgrounds.default.name', descriptionKey: 'miningPage.backgrounds.default.description', costBolt: 0, className: 'theme-default', icon: true } 
    ];