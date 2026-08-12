import React, { useState, useEffect } from 'react';
import { Heart, ListTodo, Timer, Activity, Building2, Layers, Sparkles } from 'lucide-react';
import { Header } from './components/Header';
import { SomaticMindsetTab } from './components/SomaticMindsetTab';
import { TodoFocusBitsTab } from './components/TodoFocusBitsTab';
import { MicroSprintTimer } from './components/MicroSprintTimer';
import { MedicalSymptomsTab } from './components/MedicalSymptomsTab';
import { VirtualOfficeTab } from './components/VirtualOfficeTab';
import { GoogleWorkspacePanel } from './components/GoogleWorkspacePanel';
import { PanicOverlay } from './components/PanicOverlay';
import { SessionLogsModal } from './components/SessionLogsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { NotesDrawer } from './components/NotesDrawer';
import { SettingsModal } from './components/SettingsModal';
import { SessionLog, TodoItem, SymptomLog, UserProfile, NoteItem } from './types';
import { initWorkspaceAuth, logoutGoogleWorkspace } from './lib/googleWorkspace';
import { User } from 'firebase/auth';
import {
  saveUserProfileToFirestore,
  subscribeUserProfileFromFirestore,
  saveTodoToFirestore,
  deleteTodoFromFirestore,
  subscribeTodosFromFirestore,
  saveSymptomToFirestore,
  deleteSymptomFromFirestore,
  subscribeSymptomsFromFirestore,
  saveNoteToFirestore,
  deleteNoteFromFirestore,
  subscribeNotesFromFirestore,
  saveSessionLogToFirestore,
  subscribeSessionLogsFromFirestore,
  saveUserStateToFirestore,
  subscribeUserStateFromFirestore,
} from './lib/firebase';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Calm Focus Worker',
  roleTitle: 'Zero-Adrenaline Specialist',
  dailyGoalBits: 5,
  preferredNoise: 'brown',
  avatarEmoji: '🌸',
  totalBitsLogged: 12,
  streakDays: 4,
  panicGroundingPhrase: 'I am completely safe. 1 Focus Bit is enough for today.',
  theme: 'light',
};

const DEFAULT_TODOS: TodoItem[] = [
  {
    id: 't1',
    title: 'Finalize Q3 Performance Summary',
    completed: false,
    priority: 'high',
    eisenhower: 'urgent_important',
    rule135: 'big',
    isFrog: true,
    focusBits: [
      { id: 'b1', title: 'Open document & write heading', completed: true, createdAt: Date.now() - 10000 },
      { id: 'b2', title: 'List 3 core achievements', completed: false, createdAt: Date.now() - 5000 },
      { id: 'b3', title: 'Hit save and send draft', completed: false, createdAt: Date.now() },
    ],
    createdAt: Date.now() - 100000,
  },
  {
    id: 't2',
    title: 'Review weekly team updates',
    completed: false,
    priority: 'medium',
    eisenhower: 'not_urgent_important',
    rule135: 'medium',
    focusBits: [],
    createdAt: Date.now() - 50000,
  },
  {
    id: 't3',
    title: 'Clear 3 unread emails',
    completed: true,
    priority: 'low',
    eisenhower: 'urgent_not_important',
    rule135: 'small',
    focusBits: [],
    createdAt: Date.now() - 20000,
  },
];

const DEFAULT_SYMPTOMS: SymptomLog[] = [
  {
    id: 's1',
    date: 'Today, 9:15 AM',
    timestamp: Date.now() - 3600000,
    symptomName: 'Executive Freeze State',
    severity: 6,
    triggers: 'Incoming urgent email alert',
    copingMethod: '5-4-3-2-1 Grounding',
    notes: 'Grounding helped reduce heart rate within 3 minutes.',
  },
];

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'n1',
    title: 'Somatic Micro-Goal',
    content: 'Outputting 30% with a calm heart is infinitely better than 100% with adrenaline dread.',
    category: 'somatic',
    pinned: true,
    date: 'Today',
    timestamp: Date.now(),
  },
];

// Helper to get key for current 2am reset cycle
const get2amCycleKey = (d: Date = new Date()): string => {
  const dateCopy = new Date(d);
  if (dateCopy.getHours() < 2) {
    dateCopy.setDate(dateCopy.getDate() - 1);
  }
  const year = dateCopy.getFullYear();
  const month = String(dateCopy.getMonth() + 1).padStart(2, '0');
  const day = String(dateCopy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}-02:00`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'somatic' | 'todo' | 'sprint' | 'medical' | 'office' | 'workspace'>('somatic');

  const [battery, setBattery] = useState<number>(() => {
    const saved = localStorage.getItem('zawe_battery');
    return saved ? parseInt(saved, 10) : 100;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('zawe_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('zawe_todos');
    return saved ? JSON.parse(saved) : DEFAULT_TODOS;
  });

  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>(() => {
    const saved = localStorage.getItem('zawe_symptoms');
    return saved ? JSON.parse(saved) : DEFAULT_SYMPTOMS;
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('zawe_notes');
    return saved ? JSON.parse(saved) : DEFAULT_NOTES;
  });

  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>(() => {
    const saved = localStorage.getItem('zawe_session_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [googleUser, setGoogleUser] = useState<User | null>(null);

  const [activeSprintTaskTitle, setActiveSprintTaskTitle] = useState<string>('');
  const [isPanicOpen, setIsPanicOpen] = useState<boolean>(false);
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initWorkspaceAuth(
      (user) => setGoogleUser(user),
      () => setGoogleUser(null)
    );
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore data when user is authenticated
  useEffect(() => {
    if (!googleUser) return;
    const uid = googleUser.uid;

    const unsubProfile = subscribeUserProfileFromFirestore(uid, (profile) => {
      if (profile) setUserProfile(profile);
    });

    const unsubTodos = subscribeTodosFromFirestore(uid, (remoteTodos) => {
      if (remoteTodos && remoteTodos.length > 0) {
        setTodos(remoteTodos);
      }
    });

    const unsubSymptoms = subscribeSymptomsFromFirestore(uid, (remoteSymptoms) => {
      if (remoteSymptoms && remoteSymptoms.length > 0) {
        setSymptomLogs(remoteSymptoms);
      }
    });

    const unsubNotes = subscribeNotesFromFirestore(uid, (remoteNotes) => {
      if (remoteNotes && remoteNotes.length > 0) {
        setNotes(remoteNotes);
      }
    });

    const unsubLogs = subscribeSessionLogsFromFirestore(uid, (remoteLogs) => {
      if (remoteLogs && remoteLogs.length > 0) {
        setSessionLogs(remoteLogs);
      }
    });

    const unsubState = subscribeUserStateFromFirestore(uid, (remoteBattery) => {
      if (typeof remoteBattery === 'number') setBattery(remoteBattery);
    });

    return () => {
      unsubProfile();
      unsubTodos();
      unsubSymptoms();
      unsubNotes();
      unsubLogs();
      unsubState();
    };
  }, [googleUser]);

  useEffect(() => {
    localStorage.setItem('zawe_battery', battery.toString());
    if (googleUser) {
      saveUserStateToFirestore(googleUser.uid, battery);
    }
  }, [battery, googleUser]);

  useEffect(() => {
    localStorage.setItem('zawe_profile', JSON.stringify(userProfile));
    if (userProfile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (googleUser) {
      saveUserProfileToFirestore(googleUser.uid, userProfile);
    }
  }, [userProfile, googleUser]);

  useEffect(() => {
    localStorage.setItem('zawe_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('zawe_symptoms', JSON.stringify(symptomLogs));
  }, [symptomLogs]);

  useEffect(() => {
    localStorage.setItem('zawe_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('zawe_session_logs', JSON.stringify(sessionLogs));
  }, [sessionLogs]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDrainBattery = (amount: number) => {
    setBattery((prev) => {
      const next = Math.max(0, prev - amount);
      if (next <= 25 && prev > 25) {
        triggerToast('⚠️ Cognitive Battery Low! Mandatory 3-minute somatic rest recommended.');
      }
      return next;
    });
  };

  const handleRechargeBattery = () => {
    setBattery((prev) => Math.min(100, prev + 25));
    triggerToast('🔋 Somatic Recharge applied (+25% Energy)!');
  };

  const handleLogTask = () => {
    setUserProfile((prev) => ({
      ...prev,
      totalBitsLogged: prev.totalBitsLogged + 1,
    }));
    triggerToast('✨ 1 Focus Bit Logged!');
  };

  // Daily Reset & Log Archiving Logic
  const handleDailyReset = (isAutomatic: boolean = false) => {
    const completedCount = todos.filter((t) => t.completed).length;
    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const currentCycle = get2amCycleKey();
    localStorage.setItem('zawe_last_reset_cycle', currentCycle);

    // Create archived summary log entry
    const archivedLog: SessionLog = {
      id: Date.now().toString(),
      date: dateStr,
      timestamp: Date.now(),
      tasksCompleted: completedCount,
      sprintsCount: 1,
      energyEnd: battery,
      effortRating: battery > 60 ? 'low' : battery > 30 ? 'standard' : 'high',
      notes: `${isAutomatic ? 'Automatic 2 AM' : 'Manual'} Daily Reset summary: Completed ${completedCount} tasks with ${battery}% remaining cognitive battery.`,
    };

    setSessionLogs((prev) => [archivedLog, ...prev]);
    if (googleUser) {
      saveSessionLogToFirestore(googleUser.uid, archivedLog);
    }

    // Reset daily completed todos and battery
    setTodos((prev) => {
      const updated = prev.map((t) => ({
        ...t,
        completed: false,
        focusBits: t.focusBits.map((b) => ({ ...b, completed: false })),
      }));
      if (googleUser) {
        updated.forEach((t) => saveTodoToFirestore(googleUser.uid, t));
      }
      return updated;
    });
    setBattery(100);

    triggerToast(
      isAutomatic
        ? '🌅 2 AM Auto-Reset Complete! Archived summary log and restored 100% battery.'
        : '🌅 Daily Reset Complete! Archived summary log and restored 100% battery.'
    );
  };

  // Automatic 2 AM Daily Reset Checker
  useEffect(() => {
    const check2amReset = () => {
      const lastResetCycle = localStorage.getItem('zawe_last_reset_cycle');
      const currentCycle = get2amCycleKey();

      if (!lastResetCycle) {
        localStorage.setItem('zawe_last_reset_cycle', currentCycle);
      } else if (lastResetCycle !== currentCycle) {
        handleDailyReset(true);
      }
    };

    check2amReset();
    const interval = setInterval(check2amReset, 20000);
    return () => clearInterval(interval);
  }, [todos, battery]);

  const handleClearAllData = () => {
    localStorage.clear();
    setBattery(100);
    setUserProfile(DEFAULT_PROFILE);
    setTodos(DEFAULT_TODOS);
    setSymptomLogs(DEFAULT_SYMPTOMS);
    setNotes(DEFAULT_NOTES);
    setSessionLogs([]);
    triggerToast('🧹 All stored application data cleared!');
  };

  // Todo Handler functions
  const handleAddTodo = (newTodoData: Omit<TodoItem, 'id' | 'createdAt' | 'focusBits'>) => {
    const newTodo: TodoItem = {
      ...newTodoData,
      id: Date.now().toString(),
      focusBits: [],
      createdAt: Date.now(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    if (googleUser) {
      saveTodoToFirestore(googleUser.uid, newTodo);
    }
    triggerToast('Added new task to Matrix');
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, completed: !t.completed };
          if (googleUser) {
            saveTodoToFirestore(googleUser.uid, updated);
          }
          return updated;
        }
        return t;
      })
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    if (googleUser) {
      deleteTodoFromFirestore(googleUser.uid, id);
    }
  };

  const handleShatterIntoFocusBits = (todoId: string, bitTitles: string[]) => {
    const newBits = bitTitles.map((title, idx) => ({
      id: `bit-${Date.now()}-${idx}`,
      title,
      completed: false,
      createdAt: Date.now(),
    }));

    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === todoId) {
          const updated = {
            ...t,
            focusBits: [...t.focusBits, ...newBits],
          };
          if (googleUser) {
            saveTodoToFirestore(googleUser.uid, updated);
          }
          return updated;
        }
        return t;
      })
    );
    triggerToast('Shattered task into zero-dread Focus Bits!');
  };

  const handleToggleFocusBit = (todoId: string, bitId: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== todoId) return t;
        const updatedBits = t.focusBits.map((b) =>
          b.id === bitId ? { ...b, completed: !b.completed } : b
        );
        const updated = { ...t, focusBits: updatedBits };
        if (googleUser) {
          saveTodoToFirestore(googleUser.uid, updated);
        }
        return updated;
      })
    );
    handleLogTask();
  };

  const handleSendToSprint = (taskTitle: string) => {
    setActiveSprintTaskTitle(taskTitle);
    setActiveTab('sprint');
    triggerToast(`Sent "${taskTitle}" to Sprint Timer!`);
  };

  // Symptom log handlers
  const handleAddSymptomLog = (logData: Omit<SymptomLog, 'id' | 'timestamp' | 'date'>) => {
    const newLog: SymptomLog = {
      ...logData,
      id: Date.now().toString(),
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setSymptomLogs((prev) => [newLog, ...prev]);
    if (googleUser) {
      saveSymptomToFirestore(googleUser.uid, newLog);
    }
    triggerToast('Logged somatic symptom entry');
  };

  const handleDeleteSymptomLog = (id: string) => {
    setSymptomLogs((prev) => prev.filter((l) => l.id !== id));
    if (googleUser) {
      deleteSymptomFromFirestore(googleUser.uid, id);
    }
  };

  // Notes handlers
  const handleAddNote = (noteData: Omit<NoteItem, 'id' | 'timestamp' | 'date'>) => {
    const newNote: NoteItem = {
      ...noteData,
      id: Date.now().toString(),
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    };
    setNotes((prev) => [newNote, ...prev]);
    if (googleUser) {
      saveNoteToFirestore(googleUser.uid, newNote);
    }
    triggerToast('Saved micro note');
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (googleUser) {
      deleteNoteFromFirestore(googleUser.uid, id);
    }
  };

  const handleTogglePinNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, pinned: !n.pinned };
          if (googleUser) {
            saveNoteToFirestore(googleUser.uid, updated);
          }
          return updated;
        }
        return n;
      })
    );
  };

  const handleImportTaskToMicroBar = (taskTitle: string) => {
    handleAddTodo({
      title: taskTitle,
      completed: false,
      priority: 'medium',
      eisenhower: 'not_urgent_important',
      rule135: 'small',
    });
    triggerToast(`Imported "${taskTitle}" to To-Do Matrix!`);
    setActiveTab('todo');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 flex justify-center font-sans antialiased selection:bg-pink-500/20">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <Header
          battery={battery}
          onRechargeBattery={handleRechargeBattery}
          onDrainBattery={handleDrainBattery}
          onTogglePanic={() => setIsPanicOpen(true)}
          onOpenLogs={() => setIsLogsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenNotes={() => setIsNotesOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onDailyReset={handleDailyReset}
          userProfile={userProfile}
        />

        {/* Primary Tab Navigation */}
        <nav className="flex gap-2 overflow-x-auto pb-2.5 tab-scrollbar">
          <button
            onClick={() => setActiveTab('somatic')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'somatic'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>1. Somatic & Mindset</span>
          </button>

          <button
            onClick={() => setActiveTab('todo')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'todo'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>2. To-Do & Focus Bits</span>
          </button>

          <button
            onClick={() => setActiveTab('sprint')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'sprint'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>3. Sprint Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('medical')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'medical'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>4. Medical Symptoms</span>
          </button>

          <button
            onClick={() => setActiveTab('office')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'office'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>5. Pretend Office</span>
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'workspace'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>6. Workspace Sync</span>
          </button>
        </nav>

        {/* View Panels */}
        <main className="bg-white/90 border border-pink-200/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl shadow-pink-500/5">
          {activeTab === 'somatic' && (
            <SomaticMindsetTab
              onCompleteUnfreeze={() => setActiveTab('todo')}
              logs={sessionLogs}
            />
          )}

          {activeTab === 'todo' && (
            <TodoFocusBitsTab
              todos={todos}
              onAddTodo={handleAddTodo}
              onToggleTodo={handleToggleTodo}
              onDeleteTodo={handleDeleteTodo}
              onShatterIntoFocusBits={handleShatterIntoFocusBits}
              onToggleFocusBit={handleToggleFocusBit}
              onSendToSprint={handleSendToSprint}
            />
          )}

          {activeTab === 'sprint' && (
            <MicroSprintTimer
              onLogTask={handleLogTask}
              onDrainBattery={handleDrainBattery}
              activeTaskTitle={activeSprintTaskTitle}
            />
          )}

          {activeTab === 'medical' && (
            <MedicalSymptomsTab
              symptomLogs={symptomLogs}
              onAddLog={handleAddSymptomLog}
              onDeleteLog={handleDeleteSymptomLog}
            />
          )}

          {activeTab === 'office' && <VirtualOfficeTab />}

          {activeTab === 'workspace' && (
            <GoogleWorkspacePanel
              onImportTaskToMicroBar={handleImportTaskToMicroBar}
              sessionLogs={sessionLogs}
            />
          )}
        </main>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce z-40">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Overlays / Modals */}
        <PanicOverlay
          isOpen={isPanicOpen}
          onClose={() => setIsPanicOpen(false)}
          onLogTask={handleLogTask}
          totalLogged={userProfile.totalBitsLogged}
        />

        <SessionLogsModal
          isOpen={isLogsOpen}
          onClose={() => setIsLogsOpen(false)}
          logs={sessionLogs}
          onClearLogs={() => setSessionLogs([])}
        />

        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          profile={userProfile}
          onUpdateProfile={(updated) => {
            setUserProfile(updated);
            triggerToast('Updated profile preferences!');
          }}
          totalFocusBitsLogged={userProfile.totalBitsLogged}
        />

        <NotesDrawer
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
          notes={notes}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onTogglePin={handleTogglePinNote}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          userProfile={userProfile}
          profile={userProfile}
          onUpdateProfile={(updated) => {
            setUserProfile(updated);
            triggerToast('Saved settings preferences!');
          }}
          onDailyReset={handleDailyReset}
          onClearAllData={handleClearAllData}
          googleUser={googleUser}
          onGoogleLogout={async () => {
            await logoutGoogleWorkspace();
            setGoogleUser(null);
            triggerToast('Signed out of Google Account');
          }}
        />
      </div>
    </div>
  );
}
