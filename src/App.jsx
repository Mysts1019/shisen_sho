import { useState } from 'react';
import BoardArea from './components/BoardArea.jsx';
import HelpModal from './components/HelpModal.jsx';
import Hud from './components/Hud.jsx';
import PauseModal from './components/PauseModal.jsx';
import ResultModal from './components/ResultModal.jsx';
import StartScreen from './components/StartScreen.jsx';
import { useGame } from './hooks/useGame.js';
import { useGameSounds } from './hooks/useGameSounds.js';
import { usePlayLog } from './hooks/usePlayLog.js';
import { useRecords } from './hooks/useRecords.js';

const HELP_SEEN_KEY = 'shisen-sho:seen-help';
const PLAYER_KEY = 'shisen-sho:player';
const MAX_NAME = 20;

function loadPlayer() {
  try {
    return localStorage.getItem(PLAYER_KEY) ?? '';
  } catch {
    return '';
  }
}

function loadHelpSeen() {
  try {
    return localStorage.getItem(HELP_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export default function App() {
  const {
    game,
    difficulty,
    remaining,
    timeLeft,
    selectTile,
    showHint,
    shuffle,
    pause,
    resume,
    startGame,
    restart,
    toMenu,
  } = useGame();
  const { muted, toggleMute } = useGameSounds(game, timeLeft);
  const { records, isNewRecord } = useRecords(game);
  const [helpOpen, setHelpOpen] = useState(() => !loadHelpSeen()); // 처음 방문하면 자동으로 보여준다
  const [playerName, setPlayerName] = useState(loadPlayer);
  usePlayLog(game, playerName.trim() || '익명');

  const changePlayerName = (name) => {
    const next = name.slice(0, MAX_NAME);
    setPlayerName(next);
    try {
      localStorage.setItem(PLAYER_KEY, next);
    } catch {
      // 무시
    }
  };

  const closeHelp = () => {
    setHelpOpen(false);
    try {
      localStorage.setItem(HELP_SEEN_KEY, '1');
    } catch {
      // 무시
    }
  };

  if (!game) {
    return (
      <main className="app">
        <StartScreen
          records={records}
          muted={muted}
          playerName={playerName}
          onPlayerNameChange={changePlayerName}
          onStart={startGame}
          onHelp={() => setHelpOpen(true)}
          onToggleMute={toggleMute}
        />
        {helpOpen && <HelpModal onClose={closeHelp} />}
      </main>
    );
  }

  const ended = game.status === 'cleared' || game.status === 'gameover';

  return (
    <main className="app">
      <Hud
        difficulty={difficulty}
        timeLeft={timeLeft}
        score={game.score}
        combo={game.combo}
        remaining={remaining}
        hintsLeft={game.hintsLeft}
        shufflesLeft={game.shufflesLeft}
        canHint={game.hintsLeft > 0 && !game.hint}
        muted={muted}
        onHint={showHint}
        onShuffle={shuffle}
        onPause={pause}
        onRestart={restart}
        onMenu={toMenu}
        onToggleMute={toggleMute}
      />

      <p className="message">{game.message}</p>

      <BoardArea game={game} onSelect={selectTile} hidden={game.status === 'paused'} />

      {game.status === 'paused' && (
        <PauseModal onResume={resume} onRestart={restart} onMenu={toMenu} />
      )}

      {ended && (
        <ResultModal
          status={game.status}
          score={game.score}
          bonus={game.bonus}
          remaining={remaining}
          best={records[game.difficultyId]}
          isNewRecord={isNewRecord}
          onRestart={restart}
          onMenu={toMenu}
        />
      )}
    </main>
  );
}
