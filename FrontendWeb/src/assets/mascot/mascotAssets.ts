import happy from './happy.png'
import heart from './heart.png'
import heartHands from './heart-hands.png'
import idea from './idea.png'
import surprised from './surprised.png'
import thinking from './thinking.png'
import thumbsUp from './thumbs-up.png'
import wave from './wave.png'
import waveTour from './wave-tour.png'
import wink from './wink.png'

export type MascotPose =
  | 'happy'
  | 'heart'
  | 'heartHands'
  | 'idea'
  | 'surprised'
  | 'thinking'
  | 'thumbsUp'
  | 'wave'
  | 'waveTour'
  | 'wink'

export const mascotAssets: Record<MascotPose, string> = {
  happy,
  heart,
  heartHands,
  idea,
  surprised,
  thinking,
  thumbsUp,
  wave,
  waveTour,
  wink,
}
