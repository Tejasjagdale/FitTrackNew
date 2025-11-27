const variant = {
  variantName: 'Arms Variant 1',
  exercisesList: [
    { name: 'Bicep Dumbbell Curls', sets: 3, reps: '8-12' },
    { name: 'Hammer Curls', sets: 3, reps: '8-12' },
    { name: 'Tricep Overhead Extension', sets: 3, reps: '8-12' }
  ],
  exerciseOrder: [
    { step: 1, action: 'exercise', name: 'Bicep Dumbbell Curls', set: 1, reps: '8-12', restSeconds: 60 },
    { step: 2, action: 'exercise', name: 'Bicep Dumbbell Curls', set: 2, reps: '8-12', restSeconds: 60 },
    { step: 3, action: 'exercise', name: 'Bicep Dumbbell Curls', set: 3, reps: '8-12', restSeconds: 90 },

    { step: 4, action: 'exercise', name: 'Hammer Curls', set: 1, reps: '8-12', restSeconds: 60 },
    { step: 5, action: 'exercise', name: 'Hammer Curls', set: 2, reps: '8-12', restSeconds: 60 },
    { step: 6, action: 'exercise', name: 'Hammer Curls', set: 3, reps: '8-12', restSeconds: 90 },

    { step: 7, action: 'exercise', name: 'Tricep Overhead Extension', set: 1, reps: '8-12', restSeconds: 60 },
    { step: 8, action: 'exercise', name: 'Tricep Overhead Extension', set: 2, reps: '8-12', restSeconds: 60 },
    { step: 9, action: 'exercise', name: 'Tricep Overhead Extension', set: 3, reps: '8-12', restSeconds: 90 }
  ]
} as const

export default variant
