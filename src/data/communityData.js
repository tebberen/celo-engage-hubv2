// src/data/communityData.js
// Centralised data catalogues for badges and community leaderboard snapshots.

export const BADGE_CATALOG = [
  {
    id: "gm-scout",
    title: "GM Scout",
    icon: "👋",
    description: "Send your first waves to the community and start stacking XP.",
    category: "Engagement",
    xpReward: 50,
    criteria: [
      { metric: "gmCount", label: "GM messages", target: 5 }
    ],
    tips: "Drop a friendly GM each morning to keep your streak alive."
  },
  {
    id: "deploy-pioneer",
    title: "Deploy Pioneer",
    icon: "🚀",
    description: "Launch contracts to unlock new experiences for the hub.",
    category: "Builder",
    xpReward: 125,
    criteria: [
      { metric: "deployCount", label: "Contracts deployed", target: 3 }
    ],
    tips: "Experiment with small upgrades. Every deployment counts toward mastery!"
  },
  {
    id: "donor-heart",
    title: "Donor Heart",
    icon: "💛",
    description: "Support builders and causes with on-chain donations.",
    category: "Impact",
    xpReward: 100,
    criteria: [
      { metric: "donateCount", label: "Donations sent", target: 5 },
      { metric: "totalDonated", label: "Total CELO donated", target: 5, unit: "CELO" }
    ],
    tips: "Micro-donations also count. Share the love frequently!"
  },
  {
    id: "link-curator",
    title: "Link Curator",
    icon: "🔗",
    description: "Share valuable resources that help the Celo community grow.",
    category: "Community",
    xpReward: 80,
    criteria: [
      { metric: "linkCount", label: "Links shared", target: 4 }
    ],
    tips: "Add context or small summaries so others know why your link matters."
  },
  {
    id: "governor-voice",
    title: "Governor Voice",
    icon: "🗳️",
    description: "Participate in governance to steer the direction of the project.",
    category: "Governance",
    xpReward: 90,
    criteria: [
      { metric: "voteCount", label: "Votes cast", target: 6 }
    ],
    tips: "Review proposals weekly and vote even on draft experiments."
  },
  {
    id: "xp-trailblazer",
    title: "XP Trailblazer",
    icon: "🌟",
    description: "Reach new XP milestones and level up your profile tier.",
    category: "Progression",
    xpReward: 200,
    criteria: [
      { metric: "totalXP", label: "Total XP", target: 1500 },
      { metric: "level", label: "Profile level", target: 5 }
    ],
    tips: "Mix different activities—GM, deploy, donate and vote—for the fastest XP gains."
  }
];

export const LEADERBOARD_SNAPSHOT = [
  {
    address: "0x12aB45Cd6789Ef0123456789aBCdEfABc1234567",
    username: "BuilderBee",
    totalXP: 4820,
    gmCount: 156,
    deployCount: 12,
    donateCount: 18,
    linkCount: 15,
    voteCount: 21,
    lastActive: "2024-04-08T09:32:00Z"
  },
  {
    address: "0xaBCd5678901234ef5678ABcd9012ef34567890AB",
    username: "GovGuru",
    totalXP: 4510,
    gmCount: 98,
    deployCount: 6,
    donateCount: 12,
    linkCount: 9,
    voteCount: 44,
    lastActive: "2024-04-07T18:04:00Z"
  },
  {
    address: "0x90abCDeF1234567890abCDef1234567890abCDef",
    username: "ImpactIvy",
    totalXP: 4385,
    gmCount: 134,
    deployCount: 4,
    donateCount: 27,
    linkCount: 11,
    voteCount: 19,
    lastActive: "2024-04-06T13:15:00Z"
  },
  {
    address: "0x4567890abcdef1234567890ABCDEF1234567890",
    username: "LinkLegend",
    totalXP: 3890,
    gmCount: 110,
    deployCount: 3,
    donateCount: 9,
    linkCount: 26,
    voteCount: 14,
    lastActive: "2024-04-05T07:48:00Z"
  },
  {
    address: "0x7890abcdef1234567890ABCDEF1234567890abcd",
    username: "EverydayGM",
    totalXP: 3520,
    gmCount: 210,
    deployCount: 1,
    donateCount: 6,
    linkCount: 7,
    voteCount: 8,
    lastActive: "2024-04-08T06:12:00Z"
  }
];
