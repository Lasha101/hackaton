export type Lesson = {
  topic: string;
  snippet: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const demoLessons: Lesson[] = [
  {
    topic: 'Biology',
    snippet:
      'Photosynthesis is the process plants use to turn light into food. Inside the chloroplasts, ' +
      'chlorophyll captures sunlight and uses its energy to combine carbon dioxide from the air with ' +
      'water from the soil. The result is glucose, which feeds the plant, and oxygen, which is released.',
    question: 'Which gas do plants release as a by-product of photosynthesis?',
    options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'],
    correctIndex: 1,
    explanation:
      'Think of photosynthesis as a recipe: the plant takes in carbon dioxide and water, and sunlight ' +
      'powers the reaction. Water molecules (H₂O) are split apart — the hydrogen is used to build ' +
      'glucose, and the leftover oxygen is released into the air. That is why carbon dioxide is an ' +
      'ingredient, not a by-product, and why forests are often called "the lungs of the planet".',
  },
  {
    topic: 'History',
    snippet:
      'The printing press with movable metal type was developed by Johannes Gutenberg in Mainz, ' +
      'Germany, around 1440. It let books be copied far faster and cheaper than by hand, helping ' +
      'ideas spread across Europe and fueling the Renaissance and the Reformation.',
    question: 'Who developed the movable-type printing press in Europe?',
    options: ['Leonardo da Vinci', 'Martin Luther', 'Johannes Gutenberg', 'Galileo Galilei'],
    correctIndex: 2,
    explanation:
      'Gutenberg combined several existing ideas — a screw press like those used for wine, oil-based ' +
      'ink, and individual metal letters that could be rearranged — into one system. Martin Luther ' +
      'is connected to the story because printed copies of his writings spread so quickly, but he ' +
      'used the press rather than inventing it.',
  },
  {
    topic: 'Physics',
    snippet:
      'Sound is a vibration that travels as a wave through a medium such as air, water, or solid ' +
      'materials. Because it needs particles to pass the vibration along, sound cannot travel through ' +
      'the vacuum of space. In air at room temperature it moves at about 343 meters per second.',
    question: 'Why can’t sound travel through space?',
    options: [
      'It is too cold in space',
      'There are no particles to carry the vibration',
      'Space is too dark',
      'Gravity is too weak',
    ],
    correctIndex: 1,
    explanation:
      'Picture a row of dominoes: each one has to knock over the next for the motion to travel. ' +
      'Sound works the same way, with air particles bumping into their neighbors. In the near-perfect ' +
      'vacuum of space there are almost no particles, so there is nothing to pass the vibration along — ' +
      'temperature, light, and gravity have nothing to do with it.',
  },
  {
    topic: 'Geography',
    snippet:
      'The Nile is one of the longest rivers in the world, flowing about 6,650 kilometers north ' +
      'through eleven African countries before emptying into the Mediterranean Sea. Its yearly floods ' +
      'left fertile soil along its banks, which allowed ancient Egyptian civilization to flourish.',
    question: 'Into which sea does the Nile flow?',
    options: ['The Red Sea', 'The Arabian Sea', 'The Black Sea', 'The Mediterranean Sea'],
    correctIndex: 3,
    explanation:
      'The Nile flows from south to north — unusual for a big river, which surprises many people. ' +
      'Its sources are near Lake Victoria and in the Ethiopian highlands, and it ends in a wide delta ' +
      'in northern Egypt, near Alexandria, where it meets the Mediterranean. The Red Sea is close by ' +
      'but on the other side of the desert.',
  },
];
