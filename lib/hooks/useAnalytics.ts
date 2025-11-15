'use client';

import { useMemo, useState, useEffect } from 'react';
import { CEFRLevel } from '../models/cefr';
import { getUserFullName } from '../models/user';
import { User } from '../models';
import { getStudyStats } from '../services/flashcards/stats';

interface StudentStats {
  cardsLearned: number;
  cardsMastered: number;
  streak: number;
}

export function useAnalytics(students: User[]) {
  const [studentStats, setStudentStats] = useState<Record<string, StudentStats>>({});
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch study stats for all students
  useEffect(() => {
    const fetchAllStats = async () => {
      if (students.length === 0) return;

      setIsLoadingStats(true);
      const statsMap: Record<string, StudentStats> = {};

      for (const student of students) {
        try {
          const stats = await getStudyStats(student.email);
          statsMap[student.email] = {
            cardsLearned: stats.cardsLearned,
            cardsMastered: stats.cardsMastered,
            streak: stats.streak,
          };
          console.log('📚 [Stats] Fetched for', student.email, ':', stats);
        } catch (error) {
          console.error('❌ [Stats] Error fetching for', student.email, error);
          statsMap[student.email] = { cardsLearned: 0, cardsMastered: 0, streak: 0 };
        }
      }

      setStudentStats(statsMap);
      setIsLoadingStats(false);
      console.log('✅ [Stats] All student stats fetched:', statsMap);
    };

    fetchAllStats();
  }, [students]);

  // Calculate analytics from real student data
  const analytics = useMemo(() => {
    console.log('📊 [Analytics] All students data:', students);
    console.log('📊 [Analytics] Student stats map:', studentStats);
    const totalStudents = students.length;

    // Use actual streak from study stats
    const activeStudents = students.filter(s => {
      const stats = studentStats[s.email];
      return stats ? stats.streak > 0 : false;
    }).length;

    // Use actual cardsLearned from study stats
    const totalWordsLearned = students.reduce((sum, s) => {
      const stats = studentStats[s.email];
      return sum + (stats ? stats.cardsLearned : 0);
    }, 0);

    const averageProgress = totalStudents > 0 ? totalWordsLearned / totalStudents : 0;

    // Use actual cardsMastered from study stats (cards with 70%+ mastery)
    const totalCardsMastered = students.reduce((sum, s) => {
      const stats = studentStats[s.email];
      return sum + (stats ? stats.cardsMastered : 0);
    }, 0);

    console.log('📈 [Analytics] Calculated stats:', {
      totalStudents,
      activeStudents,
      averageProgress,
      totalCardsMastered,
      totalWordsLearned
    });

    // Level distribution
    const levelDistribution: Record<CEFRLevel, number> = {
      [CEFRLevel.A1]: 0,
      [CEFRLevel.A2]: 0,
      [CEFRLevel.B1]: 0,
      [CEFRLevel.B2]: 0,
      [CEFRLevel.C1]: 0,
      [CEFRLevel.C2]: 0,
    };
    students.forEach(s => {
      const rawStudent = s as any;

      // Try multiple field names for compatibility, default to A1 like student detail page
      const level = (s.cefrLevel || rawStudent.currentLevel || rawStudent.level || CEFRLevel.A1) as CEFRLevel;

      console.log('📊 [Level Distribution] Student:', {
        email: s.email,
        resolvedLevel: level,
        cefrLevel: s.cefrLevel,
        currentLevel: rawStudent.currentLevel,
        level: rawStudent.level,
      });

      if (level in levelDistribution) {
        levelDistribution[level]++;
      }
    });

    console.log('📊 [Level Distribution] Final counts:', levelDistribution);

    // Average streak by level
    const averageStreakByLevel: Record<CEFRLevel, number> = {
      [CEFRLevel.A1]: 0,
      [CEFRLevel.A2]: 0,
      [CEFRLevel.B1]: 0,
      [CEFRLevel.B2]: 0,
      [CEFRLevel.C1]: 0,
      [CEFRLevel.C2]: 0,
    };
    Object.keys(levelDistribution).forEach(level => {
      const lvl = level as CEFRLevel;
      const studentsAtLevel = students.filter(s => {
        const rawStudent = s as any;
        const studentLevel = (s.cefrLevel || rawStudent.currentLevel || rawStudent.level || CEFRLevel.A1) as CEFRLevel;
        return studentLevel === lvl;
      });
      if (studentsAtLevel.length > 0) {
        const totalStreak = studentsAtLevel.reduce((sum, s) => {
          const stats = studentStats[s.email];
          return sum + (stats ? stats.streak : 0);
        }, 0);
        averageStreakByLevel[lvl] = totalStreak / studentsAtLevel.length;
      }
    });

    // Top performers (by actual cardsLearned from study stats)
    const topPerformers = [...students]
      .map(s => {
        const stats = studentStats[s.email] || { cardsLearned: 0, cardsMastered: 0, streak: 0 };
        const rawStudent = s as any;
        return {
          student: s,
          cardsLearned: stats.cardsLearned,
          streak: stats.streak,
          level: (s.cefrLevel || rawStudent.currentLevel || rawStudent.level || CEFRLevel.A1) as CEFRLevel,
        };
      })
      .sort((a, b) => b.cardsLearned - a.cardsLearned)
      .slice(0, 5)
      .map(({ student: s, cardsLearned, streak, level }) => {
        console.log('🏆 [Top Performer]:', {
          name: getUserFullName(s),
          email: s.email,
          cardsLearned,
          streak,
          level,
        });
        return {
          name: getUserFullName(s),
          email: s.email,
          progress: cardsLearned,
          streak: streak,
          level: level,
        };
      });

    return {
      totalStudents,
      activeStudents,
      averageProgress,
      totalCardsMastered,
      levelDistribution,
      averageStreakByLevel,
      topPerformers,
    };
  }, [students, studentStats]);

  return {
    analytics,
    isLoadingStats,
  };
}
