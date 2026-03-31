'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

/* ─── Card engine ─────────────────────────────────────────────────── */
type Suit = '♠' | '♥' | '♦' | '♣';
type Card = { suit: Suit; rank: number; label: string };
const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANK_LABELS = ['', '', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function makeDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS)
    for (let rank = 2; rank <= 14; rank++)
      deck.push({ suit, rank, label: RANK_LABELS[rank] });
  return deck;
}

function shuffle(deck: Card[]): Card[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

/* ─── Hand evaluation ─────────────────────────────────────────────── */
function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  return [
    ...combinations(rest, k - 1).map(c => [first, ...c]),
    ...combinations(rest, k),
  ];
}

function rankFive(cards: Card[]): { score: number; name: string } {
  const ranks = cards.map(c => c.rank).sort((a, b) => b - a);
  const suits = cards.map(c => c.suit);
  const flush = suits.every(s => s === suits[0]);
  const straight = ranks[0] - ranks[4] === 4 && new Set(ranks).size === 5;
  const lowStraight = ranks.join() === [14, 5, 4, 3, 2].join();
  const counts: Record<number, number> = {};
  for (const r of ranks) counts[r] = (counts[r] || 0) + 1;
  const groups = Object.entries(counts).sort((a, b) => b[1] - a[1] || Number(b[0]) - Number(a[0]));
  const gc = groups.map(([, c]) => c);
  let score = 0; let name = '';
  if (flush && (straight || lowStraight)) {
    score = ranks[0] === 14 && straight ? 9e6 : 8e6 + (lowStraight ? 5 : ranks[0]);
    name = ranks[0] === 14 && straight ? 'Royal Flush' : 'Straight Flush';
  } else if (gc[0] === 4) {
    score = 7e6 + Number(groups[0][0]) * 100 + Number(groups[1][0]); name = 'Four of a Kind';
  } else if (gc[0] === 3 && gc[1] === 2) {
    score = 6e6 + Number(groups[0][0]) * 100 + Number(groups[1][0]); name = 'Full House';
  } else if (flush) {
    score = 5e6 + ranks.reduce((a, r, i) => a + r * 15 ** (4 - i), 0); name = 'Flush';
  } else if (straight || lowStraight) {
    score = 4e6 + (lowStraight ? 5 : ranks[0]); name = 'Straight';
  } else if (gc[0] === 3) {
    score = 3e6 + Number(groups[0][0]) * 1e4; name = 'Three of a Kind';
  } else if (gc[0] === 2 && gc[1] === 2) {
    const p1 = Number(groups[0][0]), p2 = Number(groups[1][0]);
    score = 2e6 + Math.max(p1, p2) * 1000 + Math.min(p1, p2); name = 'Two Pair';
  } else if (gc[0] === 2) {
    score = 1e6 + Number(groups[0][0]) * 1e4; name = 'One Pair';
  } else {
    score = ranks.reduce((a, r, i) => a + r * 15 ** (4 - i), 0); name = 'High Card';
  }
  return { score, name };
}

function evaluateHand(cards: Card[]): { score: number; name: string } {
  if (cards.length < 5) return rankFive(cards.concat(Array(5 - cards.length).fill({ rank: 0, suit: '♠', label: '' }))); 
  const combos = combinations(cards, 5);
  let best = { score: -1, name: '' };
  for (const c of combos) { const r = rankFive(c); if (r.score > best.score) best = r; }
  return best;
}

/* ─── Types ───────────────────────────────────────────────────────── */
type Phase = 'idle' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
interface Player { name: string; chips: number; bet: number; folded: boolean; hand: Card[]; avatar: string; isAI: boolean; }

const BIG_BLIND = 20;
const SMALL_BLIND = 10;
const STARTING_CHIPS = 1000;

/* ─── Main router ─────────────────────────────────────────────────── */
export default function GameRoom() {
  const params = useParams<{ id: string }>();
  if (params?.id === 'poker') return <PokerGame />;
  if (params?.id === 'rpg') return <RPGGame />;
  return <NonPokerGame />;
}

/* ─── Poker game ──────────────────────────────────────────────────── */
function PokerGame() {
  const initPlayers = (): Player[] => [
    { name: 'You', chips: STARTING_CHIPS, bet: 0, folded: false, hand: [], avatar: 'you', isAI: false },
    { name: 'Sarah', chips: STARTING_CHIPS, bet: 0, folded: false, hand: [], avatar: 'sarah', isAI: true },
    { name: 'Alex', chips: STARTING_CHIPS, bet: 0, folded: false, hand: [], avatar: 'alex', isAI: true },
  ];

  const [players, setPlayers] = useState<Player[]>(initPlayers);
  const [deck, setDeck] = useState<Card[]>([]);
  const [community, setCommunity] = useState<Card[]>([]);
  const [pot, setPot] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentBet, setCurrentBet] = useState(0);
  const [raiseAmt, setRaiseAmt] = useState(40);
  const [message, setMessage] = useState("Welcome to Texas Hold'em! Press Deal to start.");
  const [winner, setWinner] = useState<string | null>(null);
  const [showAiCards, setShowAiCards] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => { setMessage(msg); setLog(prev => [msg, ...prev].slice(0, 6)); };

  const aiDecide = (p: Player, allPlayers: Player[], comm: Card[], bet: number): 'fold' | 'call' | 'raise' => {
    if (p.folded) return 'call';
    const cards = [...p.hand, ...comm];
    const score = cards.length >= 2 ? evaluateHand(cards).score : 0;
    const pct = Math.min(score / 1.5e6, 1);
    const toCall = bet - p.bet;
    const r = Math.random();
    if (pct > 0.65 && r < 0.55 && p.chips > toCall + BIG_BLIND) return 'raise';
    if (pct > 0.3 || toCall === 0 || r < 0.35) return 'call';
    return 'fold';
  };

  const dealGame = useCallback(() => {
    const d = shuffle(makeDeck());
    let i = 0;
    const ps: Player[] = [
      { name: 'You', chips: players[0].chips, bet: 0, folded: false, hand: [d[i++], d[i++]], avatar: 'you', isAI: false },
      { name: 'Sarah', chips: players[1].chips - SMALL_BLIND, bet: SMALL_BLIND, folded: false, hand: [d[i++], d[i++]], avatar: 'sarah', isAI: true },
      { name: 'Alex', chips: players[2].chips - BIG_BLIND, bet: BIG_BLIND, folded: false, hand: [d[i++], d[i++]], avatar: 'alex', isAI: true },
    ];
    setPlayers(ps); setDeck(d.slice(i)); setCommunity([]); setPot(SMALL_BLIND + BIG_BLIND);
    setCurrentBet(BIG_BLIND); setPhase('preflop'); setWinner(null); setShowAiCards(false);
    addLog('Blinds posted — Call, Raise or Fold.');
  }, [players]);

  const runAI = (ps: Player[], comm: Card[], p: number, bet: number, next: Phase) => {
    setAiThinking(true);
    setTimeout(() => {
      let up = [...ps]; let upPot = p; let upBet = bet; const msgs: string[] = [];
      for (let i = 1; i < up.length; i++) {
        if (up[i].folded) continue;
        const action = aiDecide(up[i], up, comm, upBet);
        up = up.map((pl, idx) => {
          if (idx !== i) return pl;
          if (action === 'fold') { msgs.push(`${pl.name} folds.`); return { ...pl, folded: true }; }
          if (action === 'raise') {
            const add = Math.min(upBet + BIG_BLIND - pl.bet, pl.chips);
            upBet = pl.bet + add; upPot += add;
            msgs.push(`${pl.name} raises to ${upBet}.`);
            return { ...pl, chips: pl.chips - add, bet: upBet };
          }
          const tc = Math.min(upBet - pl.bet, pl.chips); upPot += tc;
          msgs.push(tc === 0 ? `${pl.name} checks.` : `${pl.name} calls $${tc}.`);
          return { ...pl, chips: pl.chips - tc, bet: pl.bet + tc };
        });
      }
      setPlayers(up); setPot(upPot); setCurrentBet(upBet); setAiThinking(false);
      const still = up.filter(p => !p.folded);
      if (still.length === 1) {
        setPlayers(prev => prev.map(pl => pl.name === still[0].name ? { ...pl, chips: pl.chips + upPot } : pl));
        setPot(0); setPhase('showdown');
        setWinner(`${still[0].name} wins $${upPot}!`); return;
      }
      addLog(msgs.join(' '));
      if (next === 'showdown') doShowdown(up, comm, upPot);
      else setTimeout(() => advPhase(next, up, comm, upPot), 300);
    }, 900);
  };

  const doShowdown = (ps: Player[], comm: Card[], p: number) => {
    setShowAiCards(true);
    const active = ps.filter(pl => !pl.folded);
    const scored = active.map(pl => ({ ...pl, ...evaluateHand([...pl.hand, ...comm]) }));
    scored.sort((a, b) => b.score - a.score);
    const top = scored[0];
    setPlayers(prev => prev.map(pl => pl.name === top.name ? { ...pl, chips: pl.chips + p } : pl));
    setPot(0); setPhase('showdown');
    setWinner(`${top.name} wins $${p} with ${top.name}!`);
    addLog(`Showdown! ${top.name} wins with ${top.name}!`);
  };

  const advPhase = (cur: Phase, ps: Player[], comm: Card[], p: number) => {
    const fresh = ps.map(pl => ({ ...pl, bet: 0 }));
    let nc = [...comm]; let nd = [...deck];
    let nxt: Phase = 'showdown';
    if (cur === 'flop') { nc = [...nc, nd[0]]; nd = nd.slice(1); nxt = 'turn'; }
    else if (cur === 'turn') { nc = [...nc, nd[0]]; nd = nd.slice(1); nxt = 'river'; }
    else if (cur === 'river') nxt = 'showdown';
    setCommunity(nc); setDeck(nd); setPlayers(fresh); setCurrentBet(0);
    setPhase(nxt);
    if (nxt === 'showdown') { setTimeout(() => doShowdown(fresh, nc, p), 400); return; }
    runAI(fresh, nc, p, 0, nxt);
  };

  const playerAct = useCallback((action: 'fold' | 'call' | 'raise', amt?: number) => {
    if (aiThinking || phase === 'idle' || phase === 'showdown' || players[0].folded) return;
    let ps = [...players]; let p = pot; let bet = currentBet;
    const you = ps[0];
    if (action === 'fold') {
      ps[0] = { ...you, folded: true }; addLog('You fold.');
      setPlayers(ps);
      const still = ps.filter(pl => !pl.folded);
      if (still.length === 1) {
        setPlayers(prev => prev.map(pl => pl.name === still[0].name ? { ...pl, chips: pl.chips + p } : pl));
        setPot(0); setPhase('showdown'); setWinner(`${still[0].name} wins $${p}!`); return;
      }
    } else if (action === 'call') {
      const tc = Math.min(bet - you.bet, you.chips); p += tc;
      ps[0] = { ...you, chips: you.chips - tc, bet: you.bet + tc };
      addLog(tc === 0 ? 'You check.' : `You call $${tc}.`);
    } else if (action === 'raise' && amt) {
      const add = Math.min(amt - you.bet, you.chips); bet = you.bet + add; p += add;
      ps[0] = { ...you, chips: you.chips - add, bet: bet };
      addLog(`You raise to $${bet}.`);
    }
    setPlayers(ps); setPot(p); setCurrentBet(bet);
    // Determine next phase
    const nxtPhase: Phase = phase === 'preflop' ? 'flop' : phase === 'flop' ? 'turn' : phase === 'turn' ? 'river' : 'showdown';
    const nc = nxtPhase === 'flop' ? [deck[0], deck[1], deck[2]] : nxtPhase === 'turn' ? [...community, deck[0]] : nxtPhase === 'river' ? [...community, deck[0]] : community;
    const nd = nxtPhase === 'flop' ? deck.slice(3) : (nxtPhase === 'turn' || nxtPhase === 'river') ? deck.slice(1) : deck;
    // Run AI for current phase, then advance
    setTimeout(() => {
      let up = [...ps]; let upPot = p; let upBet = bet; const msgs: string[] = [];
      for (let i = 1; i < up.length; i++) {
        if (up[i].folded) continue;
        const ai = aiDecide(up[i], up, community, upBet);
        up = up.map((pl, idx) => {
          if (idx !== i) return pl;
          if (ai === 'fold') { msgs.push(`${pl.name} folds.`); return { ...pl, folded: true }; }
          if (ai === 'raise') {
            const add2 = Math.min(upBet + BIG_BLIND - pl.bet, pl.chips);
            upBet = pl.bet + add2; upPot += add2;
            msgs.push(`${pl.name} raises.`);
            return { ...pl, chips: pl.chips - add2, bet: upBet };
          }
          const tc2 = Math.min(upBet - pl.bet, pl.chips); upPot += tc2;
          msgs.push(tc2 === 0 ? `${pl.name} checks.` : `${pl.name} calls.`);
          return { ...pl, chips: pl.chips - tc2, bet: pl.bet + tc2 };
        });
      }
      if (msgs.length) addLog(msgs.join(' '));
      setPlayers(up); setPot(upPot); setCurrentBet(upBet);
      const still2 = up.filter(pl => !pl.folded);
      if (still2.length === 1) {
        setPlayers(prev => prev.map(pl => pl.name === still2[0].name ? { ...pl, chips: pl.chips + upPot } : pl));
        setPot(0); setPhase('showdown'); setWinner(`${still2[0].name} wins $${upPot}!`); return;
      }
      setTimeout(() => {
        const freshPs = up.map(pl => ({ ...pl, bet: 0 }));
        setCommunity(nc); setDeck(nd); setPlayers(freshPs); setCurrentBet(0); setPhase(nxtPhase);
        if (nxtPhase === 'showdown') { setTimeout(() => doShowdown(freshPs, nc, upPot), 400); return; }
        addLog(`${nxtPhase.charAt(0).toUpperCase() + nxtPhase.slice(1)} dealt.`);
        runAI(freshPs, nc, upPot, 0, nxtPhase);
      }, 400);
    }, 700);
  }, [players, pot, currentBet, phase, community, deck, aiThinking]);

  const you = players[0];
  const canCheck = you.bet >= currentBet;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(ellipse at center, #1a3a1a 0%, #0c0a09 70%)' }}>
      {/* Header */}
      <div className="h-14 border-b border-stone-800 bg-stone-900/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/games" className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-white">Texas Hold&apos;em</h1>
            <p className="text-xs text-stone-400">Pot: <span className="text-amber-400 font-bold">${pot}</span> | Phase: <span className="text-amber-400 capitalize font-medium">{phase}</span></p>
          </div>
        </div>
        {(phase === 'showdown' || phase === 'idle') && (
          <button onClick={dealGame} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
            <RefreshCw size={14} /> {phase === 'idle' ? 'Deal' : 'New Hand'}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 flex flex-col items-center justify-between p-4 md:p-6 gap-4 max-w-4xl mx-auto w-full">

        {/* AI players */}
        <div className="flex gap-4 md:gap-8 justify-center flex-wrap">
          {players.slice(1).map(p => (
            <PlayerBox key={p.name} player={p} showCards={showAiCards} community={community} />
          ))}
        </div>

        {/* Community + pot */}
        <div className="flex flex-col items-center gap-3">
          <div className="px-5 py-1.5 bg-black/40 rounded-full text-amber-400 font-bold text-sm border border-amber-500/20">
            POT: ${pot}
          </div>
          <div className="flex gap-2 md:gap-3 justify-center flex-wrap">
            {[0, 1, 2, 3, 4].map(i => (
              <AnimatePresence key={i}>
                {community[i]
                  ? <motion.div key={`card-${i}`} initial={{ rotateY: 90, scale: 0.8 }} animate={{ rotateY: 0, scale: 1 }} transition={{ delay: i * 0.08 }}>
                      <PlayCard card={community[i]} />
                    </motion.div>
                  : <div className="w-12 h-18 md:w-14 rounded-xl border-2 border-dashed border-white/10 bg-black/20" style={{ minHeight: '4.5rem' }} />
                }
              </AnimatePresence>
            ))}
          </div>
          {community.length >= 3 && !you.folded && (
            <div className="text-xs text-fuchsia-400 font-medium bg-fuchsia-500/10 px-3 py-1 rounded-full border border-fuchsia-500/20">
              Your best hand: {evaluateHand([...you.hand, ...community]).name}
            </div>
          )}
        </div>

        {/* Message */}
        <div className="text-center text-sm bg-black/30 rounded-2xl px-5 py-2.5 border border-stone-800 max-w-lg w-full">
          {winner
            ? <span className="text-amber-400 font-bold text-base">{winner}</span>
            : aiThinking
            ? <span className="text-stone-500 animate-pulse">AI is thinking...</span>
            : <span className="text-stone-300">{message}</span>}
        </div>

        {/* Player cards + actions */}
        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex gap-3">
            {you.hand.length > 0
              ? you.hand.map((c, i) => (
                  <motion.div key={i} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.12 }}>
                    <PlayCard card={c} large />
                  </motion.div>
                ))
              : [0, 1].map(i => <div key={i} className="w-16 h-24 rounded-xl border-2 border-dashed border-stone-700 bg-stone-900/30" />)}
          </div>

          {phase !== 'idle' && phase !== 'showdown' && !you.folded && !aiThinking && (
            <div className="flex gap-2 md:gap-3 flex-wrap justify-center items-center">
              <button onClick={() => playerAct('fold')} className="px-5 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold hover:bg-red-500/30 transition-colors text-sm">
                Fold
              </button>
              <button onClick={() => playerAct('call')} className="px-5 py-2.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl font-bold hover:bg-blue-500/30 transition-colors text-sm">
                {canCheck ? 'Check' : `Call $${Math.min(currentBet - you.bet, you.chips)}`}
              </button>
              <div className="flex items-center gap-2 bg-stone-900/80 border border-stone-700 rounded-xl px-3 py-1">
                <span className="text-xs text-stone-400">Raise:</span>
                <input type="range" min={currentBet + BIG_BLIND} max={Math.max(you.chips, currentBet + BIG_BLIND)} step={BIG_BLIND}
                  value={raiseAmt} onChange={e => setRaiseAmt(Number(e.target.value))}
                  className="w-20 accent-amber-500" />
                <button onClick={() => playerAct('raise', raiseAmt)} className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-bold hover:opacity-90 text-sm">
                  ${raiseAmt}
                </button>
              </div>
            </div>
          )}

          {phase === 'idle' && (
            <button onClick={dealGame} className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-bold text-lg hover:opacity-90 shadow-lg shadow-amber-500/30">
              🃏 Deal Cards
            </button>
          )}
        </div>

        {/* Chip counts */}
        <div className="flex gap-3 flex-wrap justify-center">
          {players.map(p => (
            <div key={p.name} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${p.name === 'You' ? 'border-amber-500/40 bg-amber-500/10' : 'border-stone-800 bg-stone-900/50'}`}>
              <span className={p.name === 'You' ? 'text-amber-400 font-bold' : 'text-stone-300'}>{p.name}</span>
              <span className="text-stone-400 font-mono">${p.chips}</span>
              {p.bet > 0 && <span className="text-xs text-blue-400">↑${p.bet}</span>}
              {p.folded && <span className="text-red-400 text-xs">✗</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Action log */}
      {log.length > 0 && (
        <div className="px-4 pb-4 max-w-4xl mx-auto w-full">
          <div className="text-xs text-stone-500 bg-stone-900/50 rounded-xl p-3 border border-stone-800 space-y-0.5">
            {log.slice(0, 4).map((l, i) => <div key={i} className={i === 0 ? 'text-stone-400' : ''}>{l}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────── */
function PlayCard({ card, large = false }: { card: Card; large?: boolean }) {
  const red = card.suit === '♥' || card.suit === '♦';
  return (
    <div style={{ minHeight: large ? '6rem' : '4.5rem', minWidth: large ? '4rem' : '3rem' }}
      className={`${large ? 'w-16 h-24 md:w-20 md:h-28 text-base' : 'w-12 text-sm'} bg-white rounded-xl shadow-xl flex flex-col justify-between p-1.5 border border-stone-200 select-none`}>
      <div className={`font-bold leading-tight ${red ? 'text-red-600' : 'text-stone-900'}`}>
        <div>{card.label}</div>
        <div>{card.suit}</div>
      </div>
      <div className={`text-xl text-center ${red ? 'text-red-600' : 'text-stone-900'}`}>{card.suit}</div>
    </div>
  );
}

function HiddenCard({ large = false }: { large?: boolean }) {
  return (
    <div style={{ minHeight: large ? '6rem' : '4.5rem', minWidth: large ? '4rem' : '3rem', background: 'repeating-linear-gradient(45deg,#292524 0,#292524 6px,#1c1917 6px,#1c1917 12px)' }}
      className="rounded-xl shadow-xl border border-stone-700 flex items-center justify-center">
      <span className="text-stone-600 text-2xl">🂠</span>
    </div>
  );
}

function PlayerBox({ player, showCards, community }: { player: Player; showCards: boolean; community: Card[] }) {
  const all = [...player.hand, ...community];
  const hn = showCards && all.length >= 2 ? evaluateHand(all).name : null;
  return (
    <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${player.folded ? 'opacity-40 border-stone-800' : 'border-stone-700 bg-stone-900/50'}`}>
      <img src={`https://picsum.photos/seed/${player.avatar}/100/100`} alt={player.name}
        className="w-10 h-10 rounded-full object-cover border-2 border-stone-700" referrerPolicy="no-referrer" />
      <span className="text-xs font-semibold text-stone-300">{player.name}</span>
      {hn && <span className="text-[10px] text-fuchsia-400 font-medium">{hn}</span>}
      <div className="flex gap-1.5">
        {player.hand.length > 0
          ? showCards ? player.hand.map((c, i) => <PlayCard key={i} card={c} />) : [0, 1].map(i => <HiddenCard key={i} />)
          : [0, 1].map(i => <div key={i} className="w-12 rounded-xl border border-dashed border-stone-700 bg-transparent" style={{ minHeight: '4.5rem' }} />)}
      </div>
      {player.bet > 0 && !player.folded && (
        <div className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Bet: ${player.bet}</div>
      )}
    </div>
  );
}

function NonPokerGame() {
  return (
    <div className="min-h-screen bg-[#0c0a09] flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-6xl">🚧</div>
      <h1 className="text-3xl font-bold text-white">Coming Soon</h1>
      <p className="text-stone-400 text-center max-w-md">This game is still in development. Check back soon!</p>
      <Link href="/games" className="flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-colors border border-stone-700">
        <ArrowLeft size={18} /> Back to Games
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   RPG — Dungeon Crawler
   ═══════════════════════════════════════════════════════════════════ */
type RPGPhase = 'create' | 'explore' | 'combat' | 'shop' | 'gameover' | 'win';
type RoomType  = 'start' | 'empty' | 'monster' | 'chest' | 'shop' | 'boss';
type CharClass = 'Warrior' | 'Mage' | 'Rogue';

interface RPGHero {
  name: string; cls: CharClass;
  hp: number; maxHp: number; atk: number; def: number;
  level: number; xp: number; xpNext: number; gold: number; critChance: number;
  items: string[];
}
interface RPGRoom   { type: RoomType; visited: boolean; cleared: boolean; }
interface RPGEnemy  { name: string; hp: number; maxHp: number; atk: number; icon: string; xp: number; gold: number; }

const CLS: Record<CharClass, { hp: number; atk: number; def: number; crit: number; icon: string; desc: string }> = {
  Warrior: { hp: 120, atk: 14, def: 8,  crit: 0.10, icon: '⚔️', desc: 'High health & defense' },
  Mage:    { hp:  75, atk: 24, def: 3,  crit: 0.15, icon: '🔮', desc: 'High attack, low health' },
  Rogue:   { hp:  95, atk: 18, def: 5,  crit: 0.30, icon: '🗡️', desc: 'High critical strike chance' },
};

const MONSTERS: RPGEnemy[] = [
  { name: 'Slime',     hp: 18,  maxHp: 18,  atk: 5,  icon: '🟢', xp: 10, gold: 4  },
  { name: 'Goblin',    hp: 35,  maxHp: 35,  atk: 10, icon: '👺', xp: 22, gold: 10 },
  { name: 'Skeleton',  hp: 40,  maxHp: 40,  atk: 12, icon: '💀', xp: 28, gold: 13 },
  { name: 'Orc',       hp: 55,  maxHp: 55,  atk: 16, icon: '🧌', xp: 38, gold: 18 },
  { name: 'Dark Mage', hp: 50,  maxHp: 50,  atk: 19, icon: '🧙', xp: 42, gold: 22 },
];
const BOSS: RPGEnemy = { name: 'Shadow Dragon', hp: 180, maxHp: 180, atk: 22, icon: '🐉', xp: 200, gold: 100 };

const SHOP_ITEMS = {
  potion:  { name: 'Health Potion',  icon: '🧪', cost: 12, desc: 'Restore 30 HP'  },
  gpotion: { name: 'Greater Potion', icon: '💉', cost: 28, desc: 'Restore 80 HP'  },
  sword:   { name: 'Iron Sword',     icon: '⚔️', cost: 38, desc: 'ATK +6'          },
  staff:   { name: 'Magic Staff',    icon: '🪄', cost: 38, desc: 'ATK +9'          },
  shield:  { name: 'Iron Shield',    icon: '🛡️', cost: 32, desc: 'DEF +5'          },
};

const ROOM_ICONS: Record<RoomType, string> = {
  start: '🏠', empty: '⬜', monster: '👾', chest: '📦', shop: '🏪', boss: '🐉',
};

function buildDungeon(): RPGRoom[][] {
  const g: RPGRoom[][] = Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => ({ type: 'empty' as RoomType, visited: false, cleared: false }))
  );
  g[0][0] = { type: 'start',   visited: true,  cleared: true  };
  g[4][4] = { type: 'boss',    visited: false, cleared: false };
  for (const [r, c] of [[0,1],[1,0],[2,1],[1,2],[2,3],[3,2],[3,4],[4,3],[0,3],[2,4]])
    if (!(r===4&&c===4)) g[r][c] = { type: 'monster', visited: false, cleared: false };
  for (const [r, c] of [[0,2],[1,4],[2,0],[4,1]])
    g[r][c] = { type: 'chest',   visited: false, cleared: false };
  for (const [r, c] of [[1,3],[3,1]])
    g[r][c] = { type: 'shop',    visited: false, cleared: false };
  return g;
}

function RPGGame() {
  const [phase, setPhase]   = useState<RPGPhase>('create');
  const [heroName, setHeroName] = useState('Hero');
  const [heroCls, setHeroCls]   = useState<CharClass>('Warrior');
  const [hero, setHero]     = useState<RPGHero | null>(null);
  const [dungeon, setDungeon] = useState<RPGRoom[][]>([]);
  const [pos, setPos]       = useState([0, 0]);
  const [enemy, setEnemy]   = useState<RPGEnemy | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [shopMsg, setShopMsg] = useState('');
  const [toast, setToast]   = useState('');
  const logEndRef           = useRef<HTMLDivElement>(null);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [combatLog]);

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  const startGame = () => {
    const s = CLS[heroCls];
    const h: RPGHero = {
      name: heroName.trim() || 'Hero', cls: heroCls,
      hp: s.hp, maxHp: s.hp, atk: s.atk, def: s.def,
      level: 1, xp: 0, xpNext: 50, gold: 20, critChance: s.crit,
      items: ['potion'],
    };
    setHero(h); setDungeon(buildDungeon()); setPos([0, 0]); setPhase('explore');
    notify(`Welcome, ${h.name} the ${h.cls}! Find the boss at (4,4).`);
  };

  const move = (dr: number, dc: number) => {
    if (phase !== 'explore' || !hero) return;
    const nr = pos[0] + dr, nc = pos[1] + dc;
    if (nr < 0 || nr >= 5 || nc < 0 || nc >= 5) return;
    const nd = dungeon.map(row => row.map(r => ({ ...r })));
    nd[nr][nc].visited = true;
    setDungeon(nd); setPos([nr, nc]);
    const room = nd[nr][nc];
    if (room.cleared) return;
    if (room.type === 'monster') {
      const e = { ...MONSTERS[Math.floor(Math.random() * MONSTERS.length)] };
      setEnemy(e); setCombatLog([`⚔️ A wild ${e.name} ${e.icon} appears!`]);
      setPlayerTurn(true); setPhase('combat');
    } else if (room.type === 'boss') {
      setEnemy({ ...BOSS }); setCombatLog([`🐉 The Shadow Dragon awakens! Final battle!`]);
      setPlayerTurn(true); setPhase('combat');
    } else if (room.type === 'chest') {
      nd[nr][nc].cleared = true; setDungeon(nd);
      const keys = Object.keys(SHOP_ITEMS);
      const key = keys[Math.floor(Math.random() * keys.length)];
      setHero(h => h ? { ...h, items: [...h.items, key] } : h);
      notify(`📦 Found a ${SHOP_ITEMS[key as keyof typeof SHOP_ITEMS].name}!`);
    } else if (room.type === 'shop') {
      setShopMsg(''); setPhase('shop');
    } else if (room.type === 'empty' && Math.random() < 0.3) {
      const g = Math.floor(Math.random() * 8) + 2;
      setHero(h => h ? { ...h, gold: h.gold + g } : h);
      notify(`💰 Found ${g} gold!`);
    }
  };

  const attack = () => {
    if (!hero || !enemy || !playerTurn) return;
    const crit = Math.random() < hero.critChance;
    const base = hero.atk + Math.floor(Math.random() * 4) - 1;
    const dmg  = Math.max(1, crit ? Math.floor(base * 1.5) : base);
    const newEHp = Math.max(0, enemy.hp - dmg);
    const eDmg = Math.max(1, enemy.atk - hero.def + Math.floor(Math.random() * 4) - 2);
    const newHHp = Math.max(0, hero.hp - eDmg);
    const aLog = crit ? `💥 CRIT! ${hero.name} deals ${dmg} damage!` : `⚔️ ${hero.name} attacks for ${dmg} damage.`;

    if (newEHp <= 0) {
      let nh = { ...hero, xp: hero.xp + enemy.xp, gold: hero.gold + enemy.gold };
      const logs = [aLog, `✅ ${enemy.name} defeated! +${enemy.xp} XP, +${enemy.gold}g.`];
      if (nh.xp >= nh.xpNext) {
        nh = { ...nh, level: nh.level + 1, xp: nh.xp - nh.xpNext, xpNext: Math.floor(nh.xpNext * 1.5),
               maxHp: nh.maxHp + 10, hp: Math.min(nh.hp + 20, nh.maxHp + 10), atk: nh.atk + 2, def: nh.def + 1 };
        logs.push(`🎉 LEVEL UP! Now level ${nh.level}!`);
      }
      setCombatLog(prev => [...prev, ...logs]);
      setHero(nh);
      const nd = dungeon.map(row => row.map(r => ({ ...r })));
      nd[pos[0]][pos[1]].cleared = true; setDungeon(nd);
      setEnemy(null);
      setPhase(enemy.name === BOSS.name ? 'win' : 'explore');
      return;
    }

    setEnemy(e => e ? { ...e, hp: newEHp } : e);
    setCombatLog(prev => [...prev, aLog]);
    setPlayerTurn(false);
    setTimeout(() => {
      setCombatLog(prev => [...prev, `💔 ${enemy.name} hits you for ${eDmg} damage!`]);
      setHero(h => h ? { ...h, hp: newHHp } : h);
      if (newHHp <= 0) { setCombatLog(prev => [...prev, '💀 You have been defeated...']); setPhase('gameover'); }
      else setPlayerTurn(true);
    }, 700);
  };

  const useItem = (idx: number) => {
    if (!hero || !enemy || !playerTurn) return;
    const key = hero.items[idx];
    let nh = { ...hero, items: hero.items.filter((_, i) => i !== idx) };
    let msg = '';
    if (key === 'potion')  { nh = { ...nh, hp: Math.min(nh.hp + 30, nh.maxHp) }; msg = '🧪 Used Health Potion. +30 HP.'; }
    else if (key === 'gpotion') { nh = { ...nh, hp: Math.min(nh.hp + 80, nh.maxHp) }; msg = '💉 Used Greater Potion. +80 HP.'; }
    else if (key === 'sword')  { nh = { ...nh, atk: nh.atk + 6 };  msg = '⚔️ Equipped Iron Sword! ATK +6.'; }
    else if (key === 'staff')  { nh = { ...nh, atk: nh.atk + 9 };  msg = '🪄 Equipped Magic Staff! ATK +9.'; }
    else if (key === 'shield') { nh = { ...nh, def: nh.def + 5 };   msg = '🛡️ Equipped Iron Shield! DEF +5.'; }
    setHero(nh); setCombatLog(prev => [...prev, msg]);
    const isConsumable = key === 'potion' || key === 'gpotion';
    if (isConsumable) {
      const eDmg = Math.max(1, enemy.atk - nh.def + Math.floor(Math.random() * 4) - 2);
      const newHHp = Math.max(0, nh.hp - eDmg);
      setPlayerTurn(false);
      setTimeout(() => {
        setCombatLog(prev => [...prev, `💔 ${enemy.name} attacks while you drink! ${eDmg} damage.`]);
        setHero(h => h ? { ...h, hp: newHHp } : h);
        if (newHHp <= 0) { setCombatLog(prev => [...prev, '💀 You have been defeated...']); setPhase('gameover'); }
        else setPlayerTurn(true);
      }, 700);
    }
  };

  const flee = () => {
    if (!playerTurn || !enemy) return;
    if (enemy.name === BOSS.name) { setCombatLog(prev => [...prev, '🚫 Cannot flee the final boss!']); return; }
    if (Math.random() < 0.55) {
      setCombatLog(prev => [...prev, '💨 You fled successfully!']);
      setEnemy(null); setPhase('explore');
    } else {
      const eDmg = Math.max(1, enemy.atk - (hero?.def ?? 0) + Math.floor(Math.random() * 3));
      const newHHp = Math.max(0, (hero?.hp ?? 0) - eDmg);
      setCombatLog(prev => [...prev, `❌ Failed to flee! ${enemy.name} hits for ${eDmg} damage.`]);
      setHero(h => h ? { ...h, hp: newHHp } : h);
      if (newHHp <= 0) { setCombatLog(prev => [...prev, '💀 You have been defeated...']); setPhase('gameover'); }
    }
  };

  const buyItem = (key: string) => {
    const item = SHOP_ITEMS[key as keyof typeof SHOP_ITEMS];
    if (!hero || hero.gold < item.cost) { setShopMsg('Not enough gold!'); return; }
    setHero(h => h ? { ...h, gold: h.gold - item.cost, items: [...h.items, key] } : h);
    setShopMsg(`Bought ${item.name}!`);
  };

  const leaveShop = () => {
    const nd = dungeon.map(row => row.map(r => ({ ...r })));
    nd[pos[0]][pos[1]].cleared = true; setDungeon(nd); setPhase('explore');
  };

  const resetGame = () => { setPhase('create'); setHero(null); setDungeon([]); setEnemy(null); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(ellipse at center, #12082a 0%, #0c0a09 70%)' }}>
      {/* Header */}
      <div className="h-14 border-b border-stone-800 bg-stone-900/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/games" className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-white">Dungeon Crawler RPG</h1>
            {hero && (
              <p className="text-xs text-stone-400">
                {hero.name} · Lv {hero.level} · ❤️ {hero.hp}/{hero.maxHp} · 💰 {hero.gold}g · XP {hero.xp}/{hero.xpNext}
              </p>
            )}
          </div>
        </div>
        {(phase === 'gameover' || phase === 'win') && (
          <button onClick={resetGame}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90">
            <RefreshCw size={14} /> New Game
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 max-w-5xl mx-auto w-full p-4 md:p-6">

        {/* ── Character creation ── */}
        {phase === 'create' && (
          <div className="flex-1 flex items-center justify-center">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-stone-900 rounded-3xl border border-stone-800 p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-1">Create Your Hero</h2>
              <p className="text-stone-400 text-sm mb-6">Choose your class and enter the dungeon</p>
              <div className="mb-5">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 block">Hero Name</label>
                <input value={heroName} onChange={e => setHeroName(e.target.value)} maxLength={20}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Enter your name..." />
              </div>
              <div className="mb-7">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 block">Class</label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(CLS) as CharClass[]).map(cls => (
                    <button key={cls} onClick={() => setHeroCls(cls)}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${heroCls === cls ? 'border-purple-500 bg-purple-500/10' : 'border-stone-700 bg-stone-800/50 hover:border-stone-600'}`}>
                      <span className="text-2xl">{CLS[cls].icon}</span>
                      <span className="text-sm font-bold text-white">{cls}</span>
                      <span className="text-[10px] text-stone-400 text-center leading-tight">{CLS[cls].desc}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-stone-800/50 rounded-xl border border-stone-700 grid grid-cols-4 gap-2 text-xs">
                  {[['HP', String(CLS[heroCls].hp), 'text-emerald-400'], ['ATK', String(CLS[heroCls].atk), 'text-red-400'], ['DEF', String(CLS[heroCls].def), 'text-blue-400'], ['CRIT', `${(CLS[heroCls].crit * 100).toFixed(0)}%`, 'text-amber-400']].map(([label, val, col]) => (
                    <div key={label} className="text-center">
                      <div className="text-stone-400">{label}</div>
                      <div className={`${col} font-bold`}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={startGame}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:opacity-90 shadow-lg shadow-purple-500/20">
                ⚔️ Enter the Dungeon
              </button>
            </motion.div>
          </div>
        )}

        {/* ── Explore / Shop ── */}
        {(phase === 'explore' || phase === 'shop') && hero && dungeon.length > 0 && (
          <>
            {/* Left column: stats + map + movement */}
            <div className="flex flex-col gap-4 flex-1">
              {/* Hero stats */}
              <div className="bg-stone-900/80 rounded-2xl border border-stone-800 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{CLS[hero.cls].icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-sm">{hero.name} the {hero.cls}</span>
                      <span className="text-xs text-purple-400 font-bold">Lv {hero.level}</span>
                    </div>
                    <div className="h-2 bg-stone-800 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all" style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }} />
                    </div>
                    <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all" style={{ width: `${(hero.xp / hero.xpNext) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                      <span>HP {hero.hp}/{hero.maxHp}</span><span>XP {hero.xp}/{hero.xpNext}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[['⚔️', hero.atk, 'ATK', 'text-red-400'], ['🛡️', hero.def, 'DEF', 'text-blue-400'], ['💰', hero.gold, 'GOLD', 'text-amber-400'], ['💥', `${(hero.critChance * 100).toFixed(0)}%`, 'CRIT', 'text-purple-400']].map(([ico, val, lbl, col]) => (
                    <div key={String(lbl)} className="bg-stone-800/50 rounded-lg p-1.5 border border-stone-700 text-center">
                      <div className={`${col} font-bold`}>{ico} {val}</div>
                      <div className="text-stone-500">{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minimap */}
              <div className="bg-stone-900/80 rounded-2xl border border-stone-800 p-4">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Dungeon Map</h3>
                <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                  {dungeon.map((row, r) => row.map((room, c) => {
                    const isP = pos[0] === r && pos[1] === c;
                    return (
                      <div key={`${r}-${c}`} title={room.visited ? room.type : '?'}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm border transition-all ${
                          isP ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                          : room.visited && room.cleared ? 'bg-stone-800/20 border-stone-700/20 opacity-50'
                          : room.visited ? 'bg-stone-800/60 border-stone-700'
                          : 'bg-stone-900/50 border-stone-800/50'
                        }`}>
                        {isP ? '🧙' : room.visited ? (room.cleared ? '·' : ROOM_ICONS[room.type]) : '▪'}
                      </div>
                    );
                  }))}
                </div>
                <p className="text-[10px] text-stone-500 mt-2 text-center">({pos[1]},{pos[0]}) · Boss at (4,4)</p>
              </div>

              {/* D-pad */}
              <div className="bg-stone-900/80 rounded-2xl border border-stone-800 p-4">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Move</h3>
                <div className="grid grid-cols-3 gap-2 max-w-[144px] mx-auto">
                  {[null, [-1,0,'↑'], null, [0,-1,'←'], null, [0,1,'→'], null, [1,0,'↓'], null].map((d, i) => {
                    if (!d) return i === 4
                      ? <div key={i} className="aspect-square bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 text-lg border border-amber-500/20">🧙</div>
                      : <div key={i} />;
                    const [dr, dc, arrow] = d as [number, number, string];
                    const ok = pos[0]+dr >= 0 && pos[0]+dr < 5 && pos[1]+dc >= 0 && pos[1]+dc < 5;
                    return (
                      <button key={i} onClick={() => move(dr, dc)} disabled={!ok}
                        className="aspect-square bg-stone-800 hover:bg-stone-700 disabled:opacity-25 rounded-xl flex items-center justify-center text-white font-bold text-lg border border-stone-700 transition-colors">
                        {arrow}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right column: inventory / shop */}
            <div className="w-full md:w-68 flex flex-col gap-4">
              {phase === 'shop' ? (
                <div className="bg-stone-900/80 rounded-2xl border border-amber-500/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-amber-400">🏪 Shop</h3>
                    <span className="text-xs text-stone-400">💰 {hero.gold}g</span>
                  </div>
                  {shopMsg && <p className={`text-xs px-3 py-1.5 rounded-lg border mb-3 ${shopMsg.includes('Not') ? 'text-red-400 border-red-500/20 bg-red-500/10' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'}`}>{shopMsg}</p>}
                  <div className="space-y-2 mb-4">
                    {Object.entries(SHOP_ITEMS).map(([key, item]) => (
                      <div key={key} className="flex items-center gap-2 bg-stone-800/50 rounded-xl p-2 border border-stone-700">
                        <span className="text-xl">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-stone-400">{item.desc}</p>
                        </div>
                        <button onClick={() => buyItem(key)} disabled={hero.gold < item.cost}
                          className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-30 shrink-0 transition-colors">
                          {item.cost}g
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={leaveShop} className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl border border-stone-700 text-sm font-medium transition-colors">Leave</button>
                </div>
              ) : (
                <div className="bg-stone-900/80 rounded-2xl border border-stone-800 p-4">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Inventory ({hero.items.length})</h3>
                  {hero.items.length === 0
                    ? <p className="text-stone-500 text-sm text-center py-4">Empty</p>
                    : <div className="space-y-2">
                        {hero.items.map((key, i) => {
                          const item = SHOP_ITEMS[key as keyof typeof SHOP_ITEMS];
                          if (!item) return null;
                          return (
                            <div key={i} className="flex items-center gap-2 bg-stone-800/50 rounded-xl p-2 border border-stone-700">
                              <span className="text-xl">{item.icon}</span>
                              <div className="min-w-0"><p className="text-xs font-medium text-white">{item.name}</p><p className="text-[10px] text-stone-400">{item.desc}</p></div>
                            </div>
                          );
                        })}
                      </div>
                  }
                </div>
              )}
              <div className="bg-stone-900/80 rounded-2xl border border-stone-800 p-4">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Room</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{ROOM_ICONS[dungeon[pos[0]][pos[1]].type]}</span>
                  <div>
                    <p className="text-sm font-medium text-white capitalize">{dungeon[pos[0]][pos[1]].type}</p>
                    <p className="text-[10px] text-stone-400">{dungeon[pos[0]][pos[1]].cleared ? '✓ Cleared' : 'Uncleared'}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Combat ── */}
        {phase === 'combat' && hero && enemy && (
          <div className="flex-1 flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-4">
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-red-950/50 to-stone-900 rounded-2xl border border-red-900/40 p-6 text-center">
                <div className="text-6xl mb-3">{enemy.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{enemy.name}</h3>
                <div className="h-3 bg-stone-800 rounded-full overflow-hidden mb-1 max-w-xs mx-auto">
                  <motion.div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                    animate={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} transition={{ duration: 0.4 }} />
                </div>
                <p className="text-sm text-stone-400">{enemy.hp} / {enemy.maxHp} HP</p>
              </motion.div>

              <div className="bg-stone-900/80 rounded-2xl border border-stone-800 p-4 max-h-44 overflow-y-auto">
                {combatLog.map((l, i) => (
                  <motion.p key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className={`text-sm ${i === combatLog.length - 1 ? 'text-white' : 'text-stone-400'}`}>{l}</motion.p>
                ))}
                <div ref={logEndRef} />
              </div>

              {playerTurn ? (
                <div className="flex gap-2 flex-wrap">
                  <button onClick={attack}
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl font-bold hover:opacity-90 shadow-lg shadow-red-500/20">
                    ⚔️ Attack
                  </button>
                  <button onClick={flee}
                    className="px-4 py-3 bg-stone-800 text-stone-300 rounded-2xl font-bold hover:bg-stone-700 border border-stone-700 text-sm">
                    💨 Flee
                  </button>
                </div>
              ) : (
                <div className="text-center text-stone-500 animate-pulse text-sm py-3">Enemy is attacking...</div>
              )}
            </div>

            <div className="w-full md:w-60 flex flex-col gap-4">
              <div className="bg-stone-900/80 rounded-2xl border border-stone-800 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{CLS[hero.cls].icon}</span>
                  <div><p className="font-bold text-white text-sm">{hero.name}</p><p className="text-[10px] text-stone-400">Lv {hero.level}</p></div>
                </div>
                <div className="h-2.5 bg-stone-800 rounded-full overflow-hidden mb-1">
                  <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                    animate={{ width: `${(hero.hp / hero.maxHp) * 100}%` }} transition={{ duration: 0.4 }} />
                </div>
                <p className="text-xs text-stone-400 mb-2">HP {hero.hp}/{hero.maxHp}</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="bg-stone-800/50 rounded-lg px-2 py-1 flex justify-between"><span className="text-stone-400">ATK</span><span className="text-red-400 font-bold">{hero.atk}</span></div>
                  <div className="bg-stone-800/50 rounded-lg px-2 py-1 flex justify-between"><span className="text-stone-400">DEF</span><span className="text-blue-400 font-bold">{hero.def}</span></div>
                </div>
              </div>
              <div className="bg-stone-900/80 rounded-2xl border border-stone-800 p-4 flex-1">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Use Item</h3>
                {hero.items.length === 0
                  ? <p className="text-stone-500 text-xs text-center py-2">No items</p>
                  : <div className="space-y-1.5">
                      {hero.items.map((key, i) => {
                        const item = SHOP_ITEMS[key as keyof typeof SHOP_ITEMS];
                        if (!item) return null;
                        const cons = key === 'potion' || key === 'gpotion';
                        return (
                          <button key={i} onClick={() => useItem(i)} disabled={!playerTurn}
                            className={`w-full flex items-center gap-2 p-2 rounded-xl border text-left transition-all disabled:opacity-40 ${cons ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'}`}>
                            <span>{item.icon}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-white truncate">{item.name}</p>
                              <p className="text-[10px] text-stone-400">{item.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                }
              </div>
            </div>
          </div>
        )}

        {/* ── Win / Game Over ── */}
        {(phase === 'gameover' || phase === 'win') && (
          <div className="flex-1 flex items-center justify-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-sm">
              <div className="text-7xl mb-4">{phase === 'win' ? '🏆' : '💀'}</div>
              <h2 className="text-3xl font-bold text-white mb-2">{phase === 'win' ? 'Victory!' : 'Game Over'}</h2>
              <p className="text-stone-400 mb-2">{phase === 'win' ? 'You vanquished the Shadow Dragon!' : 'You were slain in the dungeon.'}</p>
              {hero && <p className="text-stone-500 text-sm mb-6">{hero.name} the {hero.cls} · Level {hero.level} · {hero.gold} gold</p>}
              <button onClick={resetGame}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:opacity-90">
                Play Again
              </button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-800 text-white px-5 py-3 rounded-2xl shadow-xl border border-stone-700 text-sm font-medium z-50 whitespace-nowrap">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

