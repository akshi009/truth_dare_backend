import express from 'express';
import cors from 'cors';
import moreWildTruths from './truth.js';
import moreWildDares from './dare.js';


const app=express()
const Port = 3000

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}));

// app.options('*', cors());

app.use(express.json());

const rooms={}
const truth=moreWildTruths
const dare = moreWildDares

function generateId(length=6){
    return Math.random().toString(36).substring(2,2+length)
}

app.post('/room',async(req,res)=>{
    const roomId=generateId()
    rooms[roomId]={
        players:[],
        currentTurn:0,
        currentPrompt: null,
        scores: {}

    }
    res.json({roomId})

})

app.post('/room/:roomId/join',(req,res)=>{
    const { roomId } = req.params;
    const { playerName } = req.body;

     if (!rooms[roomId]) {
    return res.status(404).json({ error: "Room not found" });
  }
  if (!playerName) {
    return res.status(400).json({ error: "Player name required" });
  }

    const playerId = generateId(8);
    rooms[roomId].players.push({ playerId, playerName });
    rooms[roomId].scores[playerId] = 0;

  res.json({ playerName, players: rooms[roomId].players });
})

app.get('/room/:roomId/players',(req,res)=>{
  const {roomId}=req.params
  const room = rooms[roomId]
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  res.json({ players: rooms[roomId].players });

})


app.get('/room/:roomId',(req,res)=>{
  const {roomId} = req.params
  const room = rooms[roomId]
  if (!room) return res.status(404).json({message:'Room Not Found'})
  res.json({
    players:room.players,
    currentPrompt:room.currentPrompt,
    currentTurn:room.currentTurn,
    scores:room.scores
})
})

app.get('/prompts',(req,res)=>{
const {type} = req.query;
if(!type||!['truth','dare'].includes(type)){
  return res.status(400).json({ error: "Type must be 'truth' or 'dare'" });
}

const prompts=type === "truth"?truth:dare
const random=prompts[Math.floor(Math.random()*prompts.length)]
res.json({prompt:random})
})

app.post('/room/:roomId/next',(req,res)=>{
  const {roomId}=req.params
  const{type}=req.body

  const room = rooms[roomId];
  if (!room) return res.status(404).json({ error: "Room not found" });
  if (!type || !['truth', 'dare'].includes(type)) {
    return res.status(400).json({ error: "Type must be 'truth' or 'dare'" });
  }

  room.currentTurn=(room.currentTurn+1)%room.players.length
  const prompts=type === "truth"?truth:dare
  room.currentPrompt=prompts[Math.floor(Math.random()*prompts.length)]
  res.json({
    currentTurn:room.currentTurn,
    currentPrompt:room.currentPrompt
  })

})

app.post('/room/:roomId/score',(req,res)=>{
  const {roomId}=req.params
  const { playerId, points } = req.body;

  const room = rooms[roomId]
  if (!room) return res.status(404).json({ error: "Room not found" });
  if (!(playerId in room.scores)) {
    return res.status(404).json({ error: "Player not found in room" });
  }

  room.scores[playerId]+=points
  res.json({ scores: room.scores });

})


export default app;

