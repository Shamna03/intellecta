import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  thumbnailImg: String,
  difficulty: { type: String, enum: ["easy", "medium", "hard"] },
  createdAt: { type: Date, default: Date.now },
});

const Game = mongoose.model("Game", gameSchema);
export default Game;
