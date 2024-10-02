import { produce } from 'immer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, LogBox, Text, TouchableOpacity, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import Guest from './Guest';

LogBox.ignoreAllLogs();

export enum FoodChoice {
  black = '흑',
  white = '백',
}
type Position = [number, number];

const COUNT = 100 as const;
const ROW = 5 as const;

const initGuests = () => {
  const guests = Array.from({ length: COUNT }, () => ({
    choice: Math.random() < 0.5 ? FoodChoice.black : FoodChoice.white,
    isRevealed: false,
  }));
  return Array.from({ length: ROW }, (_, i) =>
    guests.slice((i * COUNT) / ROW, ((i + 1) * COUNT) / ROW),
  );
};

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function App() {
  const { styles } = useStyles(stylesheet);
  const step = useRef(0);

  const [guests, setGuests] = useState(initGuests());
  const [message, setMessage] = useState<string>('');
  const revealIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const countChoices = useCallback(() => {
    const blackCount = guests
      .flat()
      .filter(guest => guest.choice === FoodChoice.black).length;
    return { blackCount, whiteCount: COUNT - blackCount };
  }, [guests]);

  const revealTwoJudges = useCallback(() => {
    setGuests(
      produce(draft => {
        draft[4][9].isRevealed = true;
        draft[4][10].isRevealed = true;
      }),
    );
    setMessage(`심사위원 두 분의 투표결과 공개`);
  }, []);

  const revealToMinorCount = useCallback(() => {
    const blackPositions: Position[] = [];
    const whitePositions: Position[] = [];

    guests.forEach((row, rowIndex) => {
      row.forEach((guest, colIndex) => {
        if (!guest.isRevealed) {
          if (guest.choice === FoodChoice.black) {
            blackPositions.push([rowIndex, colIndex]);
          } else {
            whitePositions.push([rowIndex, colIndex]);
          }
        }
      });
    });

    const shuffledBlack = shuffleArray(blackPositions);
    const shuffledWhite = shuffleArray(whitePositions);

    const judgeBlackCount =
      (guests[4][9].choice === FoodChoice.black ? 1 : 0) +
      (guests[4][10].choice === FoodChoice.black ? 1 : 0);
    const judgeWhiteCount = 2 - judgeBlackCount;

    const totalBlackCount = shuffledBlack.length + judgeBlackCount;
    const totalWhiteCount = shuffledWhite.length + judgeWhiteCount;
    const minCount = Math.min(totalBlackCount, totalWhiteCount);

    let blackIndex = 0;
    let whiteIndex = 0;
    let revealedCount = judgeBlackCount + judgeWhiteCount; // 심사위원은 이미 공개됨

    const revealNext = () => {
      if (revealedCount >= minCount * 2) {
        if (revealIntervalRef.current) {
          clearInterval(revealIntervalRef.current);
        }
        setMessage(`${minCount} : ${minCount}`);
        return;
      }

      setGuests(
        produce(draft => {
          if (
            blackIndex < shuffledBlack.length &&
            (whiteIndex >= shuffledWhite.length ||
              blackIndex + judgeBlackCount < whiteIndex + judgeWhiteCount)
          ) {
            const [blackRow, blackCol] = shuffledBlack[blackIndex++];
            draft[blackRow][blackCol].isRevealed = true;
          } else if (whiteIndex < shuffledWhite.length) {
            const [whiteRow, whiteCol] = shuffledWhite[whiteIndex++];
            draft[whiteRow][whiteCol].isRevealed = true;
          }
        }),
      );

      revealedCount++;
    };

    setMessage(`${COUNT}인의 결과 공개`);
    revealIntervalRef.current = setInterval(revealNext, 100);
  }, [guests]);

  const revealMajority = useCallback(() => {
    setGuests(
      produce(draft => {
        draft.forEach(row => {
          row.forEach(guest => {
            guest.isRevealed = true;
          });
        });
      }),
    );
    const { blackCount, whiteCount } = countChoices();
    if (blackCount === whiteCount) {
      setMessage(`흑수저 팀 백수저 팀 동점`);
    } else {
      const majority =
        blackCount > whiteCount ? FoodChoice.black : FoodChoice.white;
      setMessage(
        `${majority}수저 팀 ${
          blackCount > whiteCount ? blackCount : whiteCount
        }표. 전원 생존!`,
      );
    }
  }, [countChoices]);

  const toNextStep = useCallback(() => {
    if (revealIntervalRef.current) {
      clearInterval(revealIntervalRef.current);
    }

    if (step.current === 0) {
      revealTwoJudges();
    } else if (step.current === 1) {
      revealToMinorCount();
    } else if (step.current === 2) {
      revealMajority();
    } else {
      setGuests(initGuests());
      step.current = -1;
      setMessage('');
    }
    step.current += 1;
  }, [revealTwoJudges, revealToMinorCount, revealMajority]);

  useEffect(() => {
    return () => {
      if (revealIntervalRef.current) {
        clearInterval(revealIntervalRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require('./assets/logo.png')}
        resizeMode="contain"
      />
      <View style={styles.resultContainer}>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.guestsContainer}>
          {guests.map((row, i) => {
            return (
              <View key={i} style={styles.rowContainer}>
                {row.map((guest, j) => {
                  return <Guest key={`${i}-${j}`} {...guest} />;
                })}
              </View>
            );
          })}
        </View>
      </View>
      <TouchableOpacity onPress={toNextStep}>
        <Text style={styles.buttonText}>다음 단계 공개</Text>
      </TouchableOpacity>
    </View>
  );
}

const GAP = 5 as const;

const stylesheet = createStyleSheet(() => ({
  container: {
    flex: 1,
    backgroundColor: '#rgb(32,33,36)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 50,
  },
  resultContainer: {
    marginBottom: 100,
  },
  guestsContainer: {
    gap: GAP,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: GAP,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    height: 30,
    marginBottom: 16,
    color: 'white',
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
  },
}));
