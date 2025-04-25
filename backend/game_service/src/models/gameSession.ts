import mongoose from "mongoose";

const gameSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  gameSlug: { type: String, required: true },
  score: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  datePlayed: { type: Date, default: Date.now },
});

const GameSession = mongoose.model("GameSession", gameSessionSchema);

export default GameSession;
