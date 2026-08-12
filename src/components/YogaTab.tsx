import React, { useState } from 'react';
import { Sun, Moon, Sparkles, Heart, Shield, Check, Info } from 'lucide-react';
import { audioSynth } from '../lib/audioSynth';

export type BodyType = 'regular' | 'disabled' | 'large';
export type YogaLevel = 'level1' | 'level2' | 'level3';
export type TimeOfDay = 'day' | 'night';

export interface YogaPose {
  id: string;
  name: string;
  duration: string; // e.g. "5 slow breaths (approx 1 min)"
  instruction: string;
  somaticTip: string;
  svgType: 'seated_reach' | 'cat_cow' | 'child_pose' | 'forward_fold' | 'spinal_twist' | 'standing_tall' | 'chest_opener' | 'legs_up_wall' | 'bound_angle';
}

export interface YogaPlan {
  id: string;
  title: string;
  durationMinutes: number;
  description: string;
  dayPoses: YogaPose[];
  nightPoses: YogaPose[];
}

// Minimal, elegant SVG illustrations with pink outlines on white backgrounds
const PoseIllustration: React.FC<{ svgType: YogaPose['svgType'] }> = ({ svgType }) => {
  return (
    <div className="w-full h-32 bg-white rounded-2xl border border-pink-200 flex items-center justify-center p-3 shadow-2xs transition-all hover:border-pink-400">
      <svg
        viewBox="0 0 200 120"
        className="w-full h-full text-pink-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {svgType === 'seated_reach' && (
          <g>
            {/* Chair outline */}
            <path d="M60 70 L140 70 M75 70 L75 105 M125 70 L125 105 M75 40 L75 70" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Seated Figure */}
            <circle cx="100" cy="35" r="10" />
            <path d="M100 45 L100 70 M100 55 L70 25 M100 55 L130 25" />
            <path d="M100 70 L80 90 M100 70 L120 90" />
            {/* Energy sparkles */}
            <path d="M60 20 L65 20 M62.5 17.5 L62.5 22.5" stroke="#ec4899" strokeWidth="1.5" />
            <path d="M140 20 L145 20 M142.5 17.5 L142.5 22.5" stroke="#ec4899" strokeWidth="1.5" />
          </g>
        )}

        {svgType === 'cat_cow' && (
          <g>
            {/* Tabletop / Seated Spine Wave */}
            <circle cx="45" cy="45" r="9" />
            <path d="M50 50 Q100 65 150 50" />
            <path d="M70 58 L70 95 M130 55 L130 95" />
            <path d="M90 60 Q100 45 110 60" stroke="#f472b6" strokeWidth="1.5" />
          </g>
        )}

        {svgType === 'child_pose' && (
          <g>
            {/* Supported Rest / Child's Pose */}
            <circle cx="145" cy="70" r="9" />
            <path d="M60 75 Q100 60 138 68" />
            <path d="M50 85 L80 85 M100 85 L140 85" stroke="#f472b6" strokeWidth="1.5" />
            <path d="M140 75 L170 75" />
          </g>
        )}

        {svgType === 'forward_fold' && (
          <g>
            {/* Seated or Standing Gentle Forward Fold */}
            <circle cx="95" cy="75" r="9" />
            <path d="M100 40 L100 95" stroke="#f472b6" strokeWidth="1.5" />
            <path d="M100 40 Q100 70 92 68" />
            <path d="M90 68 L60 90" />
          </g>
        )}

        {svgType === 'spinal_twist' && (
          <g>
            {/* Gentle Spinal Twist */}
            <circle cx="100" cy="30" r="9" />
            <path d="M100 39 L100 75" />
            <path d="M100 50 C80 40 80 60 100 50 C120 40 120 60 100 50" stroke="#f472b6" />
            <path d="M100 75 L80 100 M100 75 L120 100" />
          </g>
        )}

        {svgType === 'standing_tall' && (
          <g>
            {/* Mountain Pose / Seated Tall Posture */}
            <circle cx="100" cy="25" r="9" />
            <path d="M100 34 L100 75 M100 45 L75 60 M100 45 L125 60 M100 75 L85 105 M100 75 L115 105" />
            <path d="M100 12 L100 8" stroke="#ec4899" strokeWidth="2" />
          </g>
        )}

        {svgType === 'chest_opener' && (
          <g>
            {/* Gentle Chest Opener */}
            <circle cx="95" cy="30" r="9" />
            <path d="M95 39 C105 55 105 70 95 80" />
            <path d="M95 48 L65 40 M95 48 L125 40" stroke="#ec4899" />
            <path d="M95 80 L80 105 M95 80 L110 105" />
          </g>
        )}

        {svgType === 'legs_up_wall' && (
          <g>
            {/* Wall line */}
            <path d="M140 10 L140 105" stroke="#f472b6" strokeWidth="2" />
            {/* Reclined figure with legs up */}
            <circle cx="50" cy="90" r="9" />
            <path d="M59 90 L110 90 M110 90 L110 20 M110 90 L138 20" />
            <path d="M75 90 L75 105 M85 90 L85 105" />
          </g>
        )}

        {svgType === 'bound_angle' && (
          <g>
            {/* Reclined / Seated Butterfly Bound Angle */}
            <circle cx="100" cy="30" r="9" />
            <path d="M100 39 L100 70 M100 70 Q70 85 100 95 M100 70 Q130 85 100 95" />
            <path d="M100 50 L75 65 M100 50 L125 65" stroke="#f472b6" />
          </g>
        )}
      </svg>
    </div>
  );
};

// 9 Static Plans Map (3 Body Types x 3 Levels), each with Day and Night modes = 18 tailored sessions
const YOGA_PLANS: Record<string, YogaPlan> = {
  // REGULAR BODIES
  'regular-level1': {
    id: 'regular-level1',
    title: 'Regular Body — Level 1: Gentle Grounding',
    durationMinutes: 8,
    description: 'Low-impact micro-movements designed to release neck, shoulder, and spinal tension without strain.',
    dayPoses: [
      {
        id: 'r1d1',
        name: 'Seated Sky Stretch & Side Reaches',
        duration: '5 slow breaths',
        instruction: 'Reach both arms overhead on inhale. Gently lean to the left, then right on exhale.',
        somaticTip: 'Keep your shoulders soft away from ears. Feel oxygen filling your ribcage.',
        svgType: 'seated_reach',
      },
      {
        id: 'r1d2',
        name: 'Gentle Cat-Cow Spine Waves',
        duration: '6 cycles',
        instruction: 'Inhale to arch back slightly and open chest. Exhale to round spine and look toward navel.',
        somaticTip: 'Move at your natural breath speed without forcing lumbar arching.',
        svgType: 'cat_cow',
      },
      {
        id: 'r1d3',
        name: 'Supported Forward Fold Rest',
        duration: '8 deep breaths',
        instruction: 'Hinge softly at hips and let your head bow down toward knees or thighs.',
        somaticTip: 'Release all muscle effort in jaw and neck.',
        svgType: 'forward_fold',
      },
    ],
    nightPoses: [
      {
        id: 'r1n1',
        name: 'Reclined Heart Opener with Cushion',
        duration: '8 deep breaths',
        instruction: 'Lie back on a soft pillow. Allow arms to rest open at 45 degrees.',
        somaticTip: 'Signals to your brain that the day is safely over.',
        svgType: 'chest_opener',
      },
      {
        id: 'r1n2',
        name: 'Seated Gentle Torso Twist',
        duration: '5 breaths each side',
        instruction: 'Rotate upper torso gently right, holding left knee softly. Repeat left.',
        somaticTip: 'Gently releases accumulated digestive and lower back tension.',
        svgType: 'spinal_twist',
      },
      {
        id: 'r1n3',
        name: 'Bedside Legs-Up-The-Wall Rest',
        duration: '10 deep breaths',
        instruction: 'Rest legs up against a wall or bed headboard while lying flat.',
        somaticTip: 'Drains lymphatic fluid and calms heart rate for sleep.',
        svgType: 'legs_up_wall',
      },
    ],
  },
  'regular-level2': {
    id: 'regular-level2',
    title: 'Regular Body — Level 2: Soft Mobility & Flow',
    durationMinutes: 10,
    description: 'Flowing movement sequences to restore circulatory energy and spinal flexibility.',
    dayPoses: [
      {
        id: 'r2d1',
        name: 'Mountain Pose & Standing Reaches',
        duration: '6 slow breaths',
        instruction: 'Stand grounded through all four corners of feet. Sweep arms overhead on inhale.',
        somaticTip: 'Anchor your weight into the floor like deep roots.',
        svgType: 'standing_tall',
      },
      {
        id: 'r2d2',
        name: 'Dynamic Cat-Cow to Child Pose Flow',
        duration: '6 fluid transitions',
        instruction: 'Move smoothly between Cat-Cow arching and pressing hips back into Child Pose.',
        somaticTip: 'Focus on fluid joint motion rather than pose perfection.',
        svgType: 'cat_cow',
      },
      {
        id: 'r2d3',
        name: 'Standing Ragdoll Bend',
        duration: '6 deep breaths',
        instruction: 'Soft knees, bend forward from hips, grab opposite elbows and sway gently.',
        somaticTip: 'Decompresses lumbar spine after long sitting periods.',
        svgType: 'forward_fold',
      },
    ],
    nightPoses: [
      {
        id: 'r2n1',
        name: 'Wide Child Pose with Arm Walk',
        duration: '8 deep breaths',
        instruction: 'Knees wide, sink hips to heels, walk fingertips forward and gently left/right.',
        somaticTip: 'Opens side body and lats for effortless breathing.',
        svgType: 'child_pose',
      },
      {
        id: 'r2n2',
        name: 'Reclined Bound Angle Butterfly',
        duration: '10 deep breaths',
        instruction: 'Soles of feet together, knees fall open gently to sides with pillow support.',
        somaticTip: 'Releases hip adductors where stress is held.',
        svgType: 'bound_angle',
      },
    ],
  },
  'regular-level3': {
    id: 'regular-level3',
    title: 'Regular Body — Level 3: Deep Restorative Unwinding',
    durationMinutes: 12,
    description: 'Extended holds for deep connective tissue release and complete nervous system calm.',
    dayPoses: [
      {
        id: 'r3d1',
        name: 'Supported Chest & Shoulder Opener',
        duration: '8 slow breaths',
        instruction: 'Interlace fingers behind back or hold a towel, softly lift chest upwards.',
        somaticTip: 'Counteracts slouched computer posture.',
        svgType: 'chest_opener',
      },
      {
        id: 'r3d2',
        name: 'Seated Twist with Deep Exhales',
        duration: '6 breaths each side',
        instruction: 'Lengthen crown skyward on inhale, deepen twist gently on exhale.',
        somaticTip: 'Twists massage internal organs and promote vagal tone.',
        svgType: 'spinal_twist',
      },
    ],
    nightPoses: [
      {
        id: 'r3n1',
        name: 'Bedside Legs-Up Rest with Belly Breath',
        duration: '12 deep breaths',
        instruction: 'Rest legs vertically against wall, hands resting softly on belly.',
        somaticTip: 'Triggers parasympathetic nervous system for instant sleepiness.',
        svgType: 'legs_up_wall',
      },
    ],
  },

  // DISABLED BODIES (SEATED / CHAIR / WHEELCHAIR ADAPTED)
  'disabled-level1': {
    id: 'disabled-level1',
    title: 'Disabled / Seated Body — Level 1: Micro Seated Grounding',
    durationMinutes: 8,
    description: '100% seated or wheelchair-accessible exercises focused on gentle head, neck, arm, and upper torso mobility.',
    dayPoses: [
      {
        id: 'd1d1',
        name: 'Seated Sky Arm Lift or Single Arm Reach',
        duration: '5 slow breaths',
        instruction: 'Inhale to lift one or both arms toward ceiling. Rest on lap if fatigued.',
        somaticTip: 'Adapt reach to your comfortable mobility range without pain.',
        svgType: 'seated_reach',
      },
      {
        id: 'd1d2',
        name: 'Seated Shoulder Rolls & Chest Puff',
        duration: '6 slow cycles',
        instruction: 'Inhale roll shoulders up to ears, exhale roll down and back.',
        somaticTip: 'Releases upper back tightness from sitting.',
        svgType: 'chest_opener',
      },
      {
        id: 'd1d3',
        name: 'Seated Torso Forward Rest on Thighs',
        duration: '8 soft breaths',
        instruction: 'Fold upper body gently forward onto a lap pillow or thighs.',
        somaticTip: 'Gives your eyes and neck a break from screen tension.',
        svgType: 'forward_fold',
      },
    ],
    nightPoses: [
      {
        id: 'd1n1',
        name: 'Seated Gentle Head Rolls & Jaw Release',
        duration: '5 slow breaths per side',
        instruction: 'Tilt ear toward shoulder softly. Unclench jaw and let tongue drop.',
        somaticTip: 'Un-hooks cranial tension before bed.',
        svgType: 'seated_reach',
      },
      {
        id: 'd1n2',
        name: 'Seated Hug & Upper Spine Rounding',
        duration: '6 deep breaths',
        instruction: 'Wrap arms around shoulders in a gentle hug and round upper back softly.',
        somaticTip: 'Provides soothing self-touch (proprioceptive feedback).',
        svgType: 'cat_cow',
      },
    ],
  },
  'disabled-level2': {
    id: 'disabled-level2',
    title: 'Disabled / Seated Body — Level 2: Soft Wheelchair & Seated Flow',
    durationMinutes: 10,
    description: 'Expanded seated mobility utilizing chair armrests and lap support for spinal alignment.',
    dayPoses: [
      {
        id: 'd2d1',
        name: 'Seated Spine Flexion (Chair Cat-Cow)',
        duration: '6 smooth cycles',
        instruction: 'Hands on knees, press chest forward on inhale, round back on exhale.',
        somaticTip: 'Keeps spinal fluid circulating without standing.',
        svgType: 'cat_cow',
      },
      {
        id: 'd2d2',
        name: 'Seated Side Stretch with Armrest Support',
        duration: '5 breaths per side',
        instruction: 'Hold right armrest, reach left arm over head. Repeat opposite side.',
        somaticTip: 'Opens ribcage for fuller lung capacity.',
        svgType: 'seated_reach',
      },
    ],
    nightPoses: [
      {
        id: 'd2n1',
        name: 'Seated Armrest Twist',
        duration: '6 breaths each side',
        instruction: 'Gently turn torso right using chair back or armrest for support.',
        somaticTip: 'Winds down autonomic arousal.',
        svgType: 'spinal_twist',
      },
    ],
  },
  'disabled-level3': {
    id: 'disabled-level3',
    title: 'Disabled / Seated Body — Level 3: Deep Seated Restorative',
    durationMinutes: 12,
    description: 'Restful, meditative seated holds for joint preservation and nerve decompression.',
    dayPoses: [
      {
        id: 'd3d1',
        name: 'Supported Seated Lap Rest',
        duration: '10 deep breaths',
        instruction: 'Rest forearms on a firm pillow on lap. Close eyes and breathe softly.',
        somaticTip: 'Complete mental and nervous system reset.',
        svgType: 'forward_fold',
      },
    ],
    nightPoses: [
      {
        id: 'd3n1',
        name: 'Seated Bedside Soft Forward Recline',
        duration: '12 soft breaths',
        instruction: 'Lean forward onto bed or large cushion with full upper body weight supported.',
        somaticTip: 'Prepares brain for deep restorative sleep.',
        svgType: 'bound_angle',
      },
    ],
  },

  // LARGE / CURVY / EXTRA ROOM BODIES
  'large-level1': {
    id: 'large-level1',
    title: 'Large & Curvy Body — Level 1: Extra Room & Joint Support',
    durationMinutes: 8,
    description: 'Designed specifically with wide stance variations, chest/belly room adjustments, and zero joint pinching.',
    dayPoses: [
      {
        id: 'l1d1',
        name: 'Wide Stance Mountain & Sky Stretch',
        duration: '5 slow breaths',
        instruction: 'Feet hip-width to shoulder-width apart for stable base. Sweep arms overhead.',
        somaticTip: 'Wide stance provides full balance stability.',
        svgType: 'standing_tall',
      },
      {
        id: 'l1d2',
        name: 'Wide Seated / Standing Forward Fold',
        duration: '6 soft breaths',
        instruction: 'Widen knees or feet so belly rests comfortably between thighs with zero pressure.',
        somaticTip: 'Honor your body curvature—never compress your breath.',
        svgType: 'forward_fold',
      },
    ],
    nightPoses: [
      {
        id: 'l1n1',
        name: 'Wide Knees Supported Child Pose',
        duration: '8 deep breaths',
        instruction: 'Spread knees wide, place 2 pillows under chest/head, sink hips back softly.',
        somaticTip: 'Pillows elevate chest so breathing remains effortless.',
        svgType: 'child_pose',
      },
    ],
  },
  'large-level2': {
    id: 'large-level2',
    title: 'Large & Curvy Body — Level 2: Gentle Curvy Flow',
    durationMinutes: 10,
    description: 'Spacious movement flows tailored for joint comfort, hip freedom, and breathing ease.',
    dayPoses: [
      {
        id: 'l2d1',
        name: 'Wide Stance Side Angle Sweep',
        duration: '6 breaths each side',
        instruction: 'Step feet wide, rest forearm on thigh, sweep top arm over in a smooth arc.',
        somaticTip: 'Creates side-body space without knee strain.',
        svgType: 'seated_reach',
      },
    ],
    nightPoses: [
      {
        id: 'l2n1',
        name: 'Supported Reclined Butterfly with Bolster',
        duration: '10 deep breaths',
        instruction: 'Lie back on stacked bed pillows. Place pillows under knees for zero hip drag.',
        somaticTip: 'Restores spinal alignment without tightness.',
        svgType: 'bound_angle',
      },
    ],
  },
  'large-level3': {
    id: 'large-level3',
    title: 'Large & Curvy Body — Level 3: Deep Spacious Restorative',
    durationMinutes: 12,
    description: 'Luxurious restorative positions with full prop elevation and spacious breathing freedom.',
    dayPoses: [
      {
        id: 'l3d1',
        name: 'Elevated Chest Opener over Bed Edge',
        duration: '8 slow breaths',
        instruction: 'Lie with upper back supported on bed edge or thick bolster, opening arms wide.',
        somaticTip: 'Expands lung capacity and lifts posture.',
        svgType: 'chest_opener',
      },
    ],
    nightPoses: [
      {
        id: 'l3n1',
        name: 'Supported Bedside Legs-Up & Hip Cushion',
        duration: '12 deep breaths',
        instruction: 'Rest legs up on bed or wall with a folded blanket under lower back.',
        somaticTip: 'Soothes swollen ankles and heavy legs effortlessly.',
        svgType: 'legs_up_wall',
      },
    ],
  },
};

export const YogaTab: React.FC = () => {
  const [bodyType, setBodyType] = useState<BodyType>('regular');
  const [level, setLevel] = useState<YogaLevel>('level1');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [activePoseIdx, setActivePoseIdx] = useState<number>(0);

  // Derive current plan key
  const planKey = `${bodyType}-${level}`;
  const currentPlan = YOGA_PLANS[planKey] || YOGA_PLANS['regular-level1'];
  const activePoses = timeOfDay === 'day' ? currentPlan.dayPoses : currentPlan.nightPoses;
  const activePose = activePoses[activePoseIdx] || activePoses[0];

  const handleSelectBodyType = (bt: BodyType) => {
    setBodyType(bt);
    setActivePoseIdx(0);
  };

  const handleSelectLevel = (lvl: YogaLevel) => {
    setLevel(lvl);
    setActivePoseIdx(0);
  };

  const handleToggleTimeOfDay = (tod: TimeOfDay) => {
    setTimeOfDay(tod);
    setActivePoseIdx(0);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <span>Somatic Adaptive Yoga Studio</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Body-adapted yoga routines tailored for Regular, Disabled/Seated, and Large/Curvy bodies.
          </p>
        </div>

        {/* Day / Night Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold shrink-0">
          <button
            onClick={() => handleToggleTimeOfDay('day')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              timeOfDay === 'day'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>☀️ Day: Waking Up</span>
          </button>

          <button
            onClick={() => handleToggleTimeOfDay('night')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              timeOfDay === 'night'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>🌙 Night: Winding Down</span>
          </button>
        </div>
      </div>

      {/* TOP CONTROLS & SETTINGS SELECTION */}
      <div className="bg-gradient-to-br from-pink-50/70 via-purple-50/50 to-white dark:from-slate-800 dark:to-slate-900 border border-pink-200 dark:border-slate-700 p-5 rounded-3xl space-y-4 shadow-sm">
        {/* Setting 1: Body Accessibility */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase text-pink-600 dark:text-pink-400 tracking-wider block">
            1. Select Body Type Accessibility Adaptations:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleSelectBodyType('regular')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                bodyType === 'regular'
                  ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-pink-300'
              }`}
            >
              <span className="text-xs font-extrabold block">🌿 Regular Bodies</span>
              <span
                className={`text-[10px] mt-0.5 block ${
                  bodyType === 'regular' ? 'text-pink-100' : 'text-slate-400'
                }`}
              >
                Standard mobility & standing/floor postures
              </span>
            </button>

            <button
              onClick={() => handleSelectBodyType('disabled')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                bodyType === 'disabled'
                  ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-pink-300'
              }`}
            >
              <span className="text-xs font-extrabold block">♿ Disabled / Seated Bodies</span>
              <span
                className={`text-[10px] mt-0.5 block ${
                  bodyType === 'disabled' ? 'text-pink-100' : 'text-slate-400'
                }`}
              >
                100% chair & wheelchair-accessible moves
              </span>
            </button>

            <button
              onClick={() => handleSelectBodyType('large')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                bodyType === 'large'
                  ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-pink-300'
              }`}
            >
              <span className="text-xs font-extrabold block">🌸 Large / Curvy Bodies</span>
              <span
                className={`text-[10px] mt-0.5 block ${
                  bodyType === 'large' ? 'text-pink-100' : 'text-slate-400'
                }`}
              >
                Belly/chest space & joint-friendly room
              </span>
            </button>
          </div>
        </div>

        {/* Setting 2: Intensity Level */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase text-pink-600 dark:text-pink-400 tracking-wider block">
            2. Select Intensity & Depth Level:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'level1', title: 'Level 1: Gentle Grounding', desc: 'Low effort micro-stretches' },
              { id: 'level2', title: 'Level 2: Soft Mobility', desc: 'Spinal flow & circulation' },
              { id: 'level3', title: 'Level 3: Deep Restorative', desc: 'Extended unwinding holds' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => handleSelectLevel(lvl.id as YogaLevel)}
                className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                  level === lvl.id
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                }`}
              >
                <div>{lvl.title}</div>
                <div
                  className={`text-[10px] font-normal ${
                    level === lvl.id ? 'text-purple-100' : 'text-slate-400'
                  }`}
                >
                  {lvl.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SESSION INSTRUCTIONS & VISUAL POSES DISPLAY */}
      <div className="bg-white dark:bg-slate-800/60 border border-pink-100 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
        {/* Current Routine Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-pink-500 tracking-wider block">
              Active Static Plan ({timeOfDay === 'day' ? '☀️ Morning Waking Up' : '🌙 Night Bedtime Calm'})
            </span>
            <h4 className="text-base font-black text-slate-800 dark:text-slate-100">
              {currentPlan.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentPlan.description} (~{currentPlan.durationMinutes} minutes total)
            </p>
          </div>

          <div className="bg-pink-50 dark:bg-pink-950/40 border border-pink-200 text-pink-700 dark:text-pink-300 px-3.5 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-pink-500" />
            <span>Pose {activePoseIdx + 1} of {activePoses.length}</span>
          </div>
        </div>

        {/* Active Pose Showcase */}
        <div className="grid md:grid-cols-12 gap-6 items-center">
          {/* Pose Diagram with Pink Outline on White */}
          <div className="md:col-span-5 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Visual Pose Illustration (Pink Outline)
            </span>
            <PoseIllustration svgType={activePose.svgType} />
          </div>

          {/* Pose Details & Instructions */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h5 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                {activePose.name}
              </h5>
              <span className="text-[11px] font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-xl">
                ⏱️ {activePose.duration}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Step-by-Step Cues:
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                {activePose.instruction}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 space-y-1">
              <span className="text-[10px] font-bold uppercase text-pink-600 dark:text-pink-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Somatic & Accessibility Boundary Cues:
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 italic font-sans">
                "{activePose.somaticTip}"
              </p>
            </div>
          </div>
        </div>

        {/* Pose Navigation Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            disabled={activePoseIdx === 0}
            onClick={() => setActivePoseIdx((i) => Math.max(0, i - 1))}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
          >
            ← Previous Pose
          </button>

          <div className="flex items-center gap-1.5">
            {activePoses.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setActivePoseIdx(idx)}
                className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                  activePoseIdx === idx ? 'bg-pink-500 scale-125' : 'bg-slate-200 dark:bg-slate-700 hover:bg-pink-300'
                }`}
                title={p.name}
              />
            ))}
          </div>

          <button
            onClick={() => {
              audioSynth.playChime();
              if (activePoseIdx < activePoses.length - 1) {
                setActivePoseIdx((i) => i + 1);
              } else {
                setActivePoseIdx(0);
              }
            }}
            className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-md shadow-pink-500/20 cursor-pointer transition-all"
          >
            {activePoseIdx < activePoses.length - 1 ? 'Next Pose →' : 'Complete Routine ✨'}
          </button>
        </div>
      </div>
    </div>
  );
};
