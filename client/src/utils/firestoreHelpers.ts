import { collection, addDoc, getDocs } from 'firebase/firestore';
import db from '../firebase';

export async function saveResultToFirestore(
  score: number,
  answers: Record<string, string>,
  explanations: Record<string, string>
) {
  try {
    await addDoc(collection(db, 'diagnostic_results'), {
      timestamp: new Date().toISOString(),
      score,
      answers,
      explanations,
    });
  } catch (err) {
    console.error('🔥 Firestore save error:', err);
  }
}

export async function fetchAdminStatsFromFirestore() {
  try {
    const snapshot = await getDocs(collection(db, 'diagnostic_results'));
    let total = 0;
    let scoreSum = 0;
    const missCounts: Record<string, number> = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      total++;
      scoreSum += data.score || 0;
      const answers = data.answers || {};
      const explanations = data.explanations || {};
      Object.keys(answers).forEach((qid) => {
        const explanation = explanations[qid] || '';
        if (explanation.toLowerCase().includes('incorrect') || explanation.toLowerCase().includes('wrong')) {
          missCounts[qid] = (missCounts[qid] || 0) + 1;
        }
      });
    });

    const sortedMissed = Object.entries(missCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([qid]) => qid);

    return {
      totalSubmissions: total,
      averageScore: total ? Math.round(scoreSum / total) : 0,
      mostMissed: sortedMissed,
    };
  } catch (err) {
    console.error('🔥 Firestore fetch error:', err);
    return {
      totalSubmissions: 0,
      averageScore: 0,
      mostMissed: [],
    };
  }
}
