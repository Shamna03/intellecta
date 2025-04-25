import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required:true},
    bestScores: { type: Map, of: Number, default: {} },
    totalScore: { type: Number, default: 0 },
    totalTimePlayed: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    lastPlayedGame: { type: String },
    lastPlayedDate: { type: Date },
    badges: {type: [String], default: []}
  });
  
  const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
  export default Leaderboard
  