const TRACKING_TYPES = {
  jumping_jack: {
    label: 'Jumping jacks',
    mode: 'repetitions',
    workPhase: 'open',
    restPhase: 'closed',
  },
  squat: {
    label: 'Squat',
    mode: 'repetitions',
    workPhase: 'down',
    restPhase: 'up',
  },
  heel_drop: {
    label: 'Heel drop',
    mode: 'repetitions',
    workPhase: 'lowered',
    restPhase: 'raised',
  },
  knee_bend: {
    label: 'Knie buigen',
    mode: 'repetitions',
    workPhase: 'bent',
    restPhase: 'straight',
  },
  single_leg_balance: {
    label: 'Balans op één been',
    mode: 'time',
  },
  generic: {
    label: 'Algemene houding',
    mode: 'time',
  },
}

export const exerciseTrackingOptions = Object.entries(TRACKING_TYPES).map(
  ([value, definition]) => ({ value, label: definition.label })
)

const clamp = (value, minimum = 0, maximum = 100) =>
  Math.min(maximum, Math.max(minimum, value))

const visibility = (point) => point ? (point.visibility ?? 1) : 0

const hasVisiblePoints = (points, indexes, minimumVisibility = 0.5) =>
  indexes.every((index) => points[index] && visibility(points[index]) >= minimumVisibility)

const distance = (pointA, pointB) => {
  if (!pointA || !pointB) return 0

  return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y)
}

const midpoint = (pointA, pointB) => ({
  x: (pointA.x + pointB.x) / 2,
  y: (pointA.y + pointB.y) / 2,
})

export const calculateJointAngle = (pointA, vertex, pointC) => {
  if (!pointA || !vertex || !pointC) return 0

  const vectorA = { x: pointA.x - vertex.x, y: pointA.y - vertex.y }
  const vectorC = { x: pointC.x - vertex.x, y: pointC.y - vertex.y }
  const magnitude = Math.hypot(vectorA.x, vectorA.y) * Math.hypot(vectorC.x, vectorC.y)

  if (!magnitude) return 0

  const cosine = clamp(
    ((vectorA.x * vectorC.x) + (vectorA.y * vectorC.y)) / magnitude,
    -1,
    1
  )

  return Math.round((Math.acos(cosine) * 180) / Math.PI)
}

const angleFromVertical = (topPoint, bottomPoint) => {
  if (!topPoint || !bottomPoint) return 90

  const horizontalDifference = Math.abs(topPoint.x - bottomPoint.x)
  const verticalDifference = Math.abs(topPoint.y - bottomPoint.y)

  return Math.round((Math.atan2(horizontalDifference, verticalDifference) * 180) / Math.PI)
}

const getSide = (points, indexes) => {
  const leftIndexes = indexes.map((index) => index.left)
  const rightIndexes = indexes.map((index) => index.right)
  const leftScore = leftIndexes.reduce((score, index) => score + visibility(points[index]), 0)
  const rightScore = rightIndexes.reduce((score, index) => score + visibility(points[index]), 0)

  return leftScore >= rightScore ? 'left' : 'right'
}

const sideIndex = (side, left, right) => side === 'left' ? left : right

const notVisibleResult = (message = 'Ga volledig in beeld staan') => ({
  bodyVisible: false,
  isCorrectPosition: false,
  phase: null,
  score: 0,
  tone: 'warning',
  feedback: message,
  metrics: [],
})

const evaluateSquat = (points) => {
  const side = getSide(points, [
    { left: 11, right: 12 },
    { left: 23, right: 24 },
    { left: 25, right: 26 },
    { left: 27, right: 28 },
  ])
  const indexes = [
    sideIndex(side, 11, 12),
    sideIndex(side, 23, 24),
    sideIndex(side, 25, 26),
    sideIndex(side, 27, 28),
  ]

  if (!hasVisiblePoints(points, indexes)) return notVisibleResult()

  const [shoulderIndex, hipIndex, kneeIndex, ankleIndex] = indexes
  const kneeAngle = calculateJointAngle(
    points[hipIndex],
    points[kneeIndex],
    points[ankleIndex]
  )
  const torsoLean = angleFromVertical(points[shoulderIndex], points[hipIndex])
  const phase = kneeAngle <= 112 ? 'down' : kneeAngle >= 155 ? 'up' : 'moving'
  const backIsStraight = torsoLean <= 42
  const bottomIsControlled = kneeAngle >= 65
  const isCorrectPosition = backIsStraight && bottomIsControlled

  let feedback
  let tone = 'guidance'

  if (!backIsStraight) {
    feedback = 'Houd je borst wat meer rechtop'
  } else if (phase === 'down') {
    feedback = bottomIsControlled ? 'Goed! Kom nu rustig terug omhoog' : 'Zak niet verder door'
    tone = bottomIsControlled ? 'success' : 'guidance'
  } else if (phase === 'up') {
    feedback = 'Start je volgende squat'
    tone = 'success'
  } else {
    feedback = 'Zak nog iets dieper'
  }

  const postureScore = backIsStraight ? 100 : clamp(100 - ((torsoLean - 25) * 2.2))
  const depthScore = phase === 'up' ? 90 : clamp(((170 - kneeAngle) / 70) * 100)

  return {
    bodyVisible: true,
    isCorrectPosition,
    phase,
    score: Math.round((postureScore * 0.55) + (depthScore * 0.45)),
    tone,
    feedback,
    metrics: [
      { label: 'Kniehoek', value: `${kneeAngle}°` },
      { label: 'Rughelling', value: `${torsoLean}°` },
    ],
  }
}

const getLegAngle = (points, side) => {
  const hip = sideIndex(side, 23, 24)
  const knee = sideIndex(side, 25, 26)
  const ankle = sideIndex(side, 27, 28)

  if (!hasVisiblePoints(points, [hip, knee, ankle], 0.45)) return null

  return calculateJointAngle(points[hip], points[knee], points[ankle])
}

const evaluateKneeBend = (points) => {
  if (!hasVisiblePoints(points, [11, 12, 23, 24], 0.45)) return notVisibleResult()

  const leftAngle = getLegAngle(points, 'left')
  const rightAngle = getLegAngle(points, 'right')

  if (leftAngle === null && rightAngle === null) return notVisibleResult()

  const availableAngles = [
    leftAngle === null ? null : { side: 'left', angle: leftAngle },
    rightAngle === null ? null : { side: 'right', angle: rightAngle },
  ].filter(Boolean)
  const movingLeg = availableAngles.reduce((smallest, current) =>
    current.angle < smallest.angle ? current : smallest
  )
  const supportAngle = movingLeg.side === 'left' ? rightAngle : leftAngle
  const shoulders = midpoint(points[11], points[12])
  const hips = midpoint(points[23], points[24])
  const torsoLean = angleFromVertical(shoulders, hips)
  const phase = movingLeg.angle <= 82 ? 'bent' : movingLeg.angle >= 150 ? 'straight' : 'moving'
  const supportIsStable = supportAngle === null || supportAngle >= 140
  const torsoIsStable = torsoLean <= 30
  const isCorrectPosition = supportIsStable && torsoIsStable

  let feedback = 'Breng je hiel rustig naar achter'
  let tone = 'guidance'

  if (!supportIsStable) {
    feedback = 'Houd je steunbeen zo recht mogelijk'
  } else if (!torsoIsStable) {
    feedback = 'Blijf mooi rechtop staan'
  } else if (phase === 'bent') {
    feedback = 'Goed gebogen! Strek je been weer rustig'
    tone = 'success'
  } else if (phase === 'straight') {
    feedback = 'Klaar voor de volgende herhaling'
    tone = 'success'
  }

  const bendScore = phase === 'bent'
    ? clamp(((150 - movingLeg.angle) / 68) * 100)
    : phase === 'straight' ? 90 : 72

  return {
    bodyVisible: true,
    isCorrectPosition,
    phase,
    score: Math.round((bendScore * 0.55) + (supportIsStable ? 25 : 10) + (torsoIsStable ? 20 : 8)),
    tone,
    feedback,
    metrics: [
      { label: 'Kniehoek', value: `${movingLeg.angle}°` },
      { label: 'Steunbeen', value: supportIsStable ? 'Stabiel' : 'Buigt' },
    ],
  }
}

const evaluateHeelDrop = (points) => {
  const side = getSide(points, [
    { left: 11, right: 12 },
    { left: 23, right: 24 },
    { left: 25, right: 26 },
    { left: 27, right: 28 },
    { left: 29, right: 30 },
    { left: 31, right: 32 },
  ])
  const shoulderIndex = sideIndex(side, 11, 12)
  const hipIndex = sideIndex(side, 23, 24)
  const kneeIndex = sideIndex(side, 25, 26)
  const ankleIndex = sideIndex(side, 27, 28)
  const heelIndex = sideIndex(side, 29, 30)
  const footIndex = sideIndex(side, 31, 32)
  const indexes = [shoulderIndex, hipIndex, kneeIndex, ankleIndex, heelIndex, footIndex]

  if (!hasVisiblePoints(points, indexes, 0.45)) {
    return notVisibleResult('Draai een beetje zijwaarts en houd je voeten in beeld')
  }

  const bodyHeight = Math.max(distance(points[shoulderIndex], points[ankleIndex]), 0.2)
  const heelHeight = (points[footIndex].y - points[heelIndex].y) / bodyHeight
  const kneeAngle = calculateJointAngle(
    points[hipIndex],
    points[kneeIndex],
    points[ankleIndex]
  )
  const torsoLean = angleFromVertical(points[shoulderIndex], points[hipIndex])
  const phase = heelHeight >= 0.025
    ? 'raised'
    : heelHeight <= -0.005
      ? 'lowered'
      : 'moving'
  const kneeIsStraight = kneeAngle >= 145
  const torsoIsStable = torsoLean <= 32
  const isCorrectPosition = kneeIsStraight && torsoIsStable

  let feedback = 'Laat je hiel rustig zakken'
  let tone = 'guidance'

  if (!kneeIsStraight) {
    feedback = 'Houd je knie recht tijdens de beweging'
  } else if (!torsoIsStable) {
    feedback = 'Blijf met je bovenlichaam rechtop'
  } else if (phase === 'lowered') {
    feedback = 'Goed gezakt! Duw jezelf weer omhoog'
    tone = 'success'
  } else if (phase === 'raised') {
    feedback = 'Mooi omhoog, laat je hiel opnieuw zakken'
    tone = 'success'
  }

  const movementScore = phase === 'moving' ? 72 : 96

  return {
    bodyVisible: true,
    isCorrectPosition,
    phase,
    score: Math.round((movementScore * 0.6) + (kneeIsStraight ? 25 : 10) + (torsoIsStable ? 15 : 5)),
    tone,
    feedback,
    metrics: [
      { label: 'Hielpositie', value: phase === 'raised' ? 'Omhoog' : phase === 'lowered' ? 'Omlaag' : 'Beweegt' },
      { label: 'Kniehoek', value: `${kneeAngle}°` },
    ],
  }
}

const evaluateSingleLegBalance = (points) => {
  const requiredIndexes = [11, 12, 23, 24, 25, 26, 27, 28]

  if (!hasVisiblePoints(points, requiredIndexes, 0.35)) return notVisibleResult()

  const shoulders = midpoint(points[11], points[12])
  const hips = midpoint(points[23], points[24])
  const leftIsSupport = points[27].y >= points[28].y
  const supportSide = leftIsSupport ? 'left' : 'right'
  const raisedSide = leftIsSupport ? 'right' : 'left'
  const supportAnkleIndex = leftIsSupport ? 27 : 28
  const raisedAnkleIndex = leftIsSupport ? 28 : 27
  const bodyHeight = Math.max(
    distance(shoulders, points[supportAnkleIndex]),
    0.2
  )
  const supportKneeAngle = getLegAngle(points, supportSide)
  const raisedKneeAngle = getLegAngle(points, raisedSide)
  const ankleDifference = (
    points[supportAnkleIndex].y - points[raisedAnkleIndex].y
  ) / bodyHeight
  const torsoLean = angleFromVertical(shoulders, hips)
  const footIsClearlyHigher = ankleDifference >= 0.045
  const liftedLegIsBent = raisedKneeAngle !== null && raisedKneeAngle <= 125
  const footIsRaised = footIsClearlyHigher
    || (ankleDifference >= 0.02 && liftedLegIsBent)
  const supportIsStraight = supportKneeAngle === null || supportKneeAngle >= 130
  const torsoIsStable = torsoLean <= 32
  const isCorrectPosition = footIsRaised && supportIsStraight && torsoIsStable

  let feedback = 'Til één voet van de grond'
  let tone = 'guidance'

  if (footIsRaised && !supportIsStraight) {
    feedback = 'Maak je steunbeen iets rechter'
  } else if (footIsRaised && !torsoIsStable) {
    feedback = 'Probeer je bovenlichaam stil te houden'
  } else if (isCorrectPosition) {
    feedback = 'Perfect! Houd deze houding vast'
    tone = 'success'
  }

  const heightScore = clamp((ankleDifference / 0.08) * 100)
  const score = isCorrectPosition
    ? Math.round((heightScore * 0.45) + 55)
    : Math.round((heightScore * 0.45) + (supportIsStraight ? 25 : 10) + (torsoIsStable ? 20 : 8))

  return {
    bodyVisible: true,
    isCorrectPosition,
    phase: isCorrectPosition ? 'holding' : 'preparing',
    score: clamp(score),
    tone,
    feedback,
    metrics: [
      { label: 'Voet', value: footIsRaised ? 'Omhoog' : 'Op de grond' },
      { label: 'Balans', value: torsoIsStable ? 'Stabiel' : 'Zoeken' },
      { label: 'Voethoogte', value: `${Math.max(0, Math.round(ankleDifference * 100))}%` },
    ],
  }
}

const evaluateJumpingJack = (points) => {
  const requiredIndexes = [11, 12, 13, 14, 15, 16, 23, 24, 27, 28]

  if (!hasVisiblePoints(points, requiredIndexes, 0.35)) return notVisibleResult()

  const shoulderWidth = Math.max(distance(points[11], points[12]), 0.08)
  const hipWidth = Math.max(distance(points[23], points[24]), 0.08)
  const referenceWidth = Math.max(shoulderWidth, hipWidth)
  const ankleWidth = distance(points[27], points[28])
  const ankleRatio = ankleWidth / referenceWidth
  const armsUp = points[15].y < points[11].y + 0.02
    && points[16].y < points[12].y + 0.02
    && points[13].y < points[23].y
    && points[14].y < points[24].y
  const armsDown = points[15].y > points[11].y + 0.1
    && points[16].y > points[12].y + 0.1
  const legsOpen = ankleRatio >= 1.3
  const legsClosed = ankleRatio <= 1.45
  const phase = armsUp && legsOpen
    ? 'open'
    : armsDown && legsClosed
      ? 'closed'
      : 'moving'
  const upperAndLowerBodyMatch = (armsUp && legsOpen) || (armsDown && legsClosed)

  let feedback = 'Open je armen en benen tegelijk'
  let tone = 'guidance'

  if (phase === 'open') {
    feedback = 'Mooi open! Spring gecontroleerd terug'
    tone = 'success'
  } else if (phase === 'closed') {
    feedback = 'Goed gesloten, klaar voor de volgende'
    tone = 'success'
  } else if (armsUp && !legsOpen) {
    feedback = 'Zet je voeten nog wat verder uit elkaar'
  } else if (legsOpen && !armsUp) {
    feedback = 'Breng beide handen boven je schouders'
  } else if (armsDown && !legsClosed) {
    feedback = 'Breng je voeten terug dichter bij elkaar'
  } else if (legsClosed && !armsDown) {
    feedback = 'Breng je armen volledig terug omlaag'
  }

  const armScore = armsUp || armsDown ? 100 : 60
  const legScore = legsOpen || legsClosed ? 100 : 60

  return {
    bodyVisible: true,
    isCorrectPosition: upperAndLowerBodyMatch,
    phase,
    score: Math.round((armScore + legScore) / 2),
    tone,
    feedback,
    metrics: [
      { label: 'Armen', value: armsUp ? 'Omhoog' : armsDown ? 'Omlaag' : 'Bewegen' },
      {
        label: 'Benen',
        value: phase === 'open'
          ? 'Open'
          : phase === 'closed'
            ? 'Gesloten'
            : 'Bewegen',
      },
      { label: 'Spreiding', value: `${ankleRatio.toFixed(1)}×` },
    ],
  }
}

const evaluateGenericPose = (points) => {
  const requiredIndexes = [0, 11, 12, 23, 24, 25, 26, 27, 28]
  const bodyVisible = hasVisiblePoints(points, requiredIndexes, 0.45)

  if (!bodyVisible) return notVisibleResult()

  return {
    bodyVisible: true,
    isCorrectPosition: true,
    phase: 'visible',
    score: 75,
    tone: 'guidance',
    feedback: 'Je bent goed zichtbaar. Voor deze oefening is nog geen specifieke bewegingsregel gekozen.',
    metrics: [{ label: 'Tracking', value: 'Algemeen' }],
  }
}

export const getExerciseTrackingType = (exercise) => {
  if (exercise?.tracking_type && TRACKING_TYPES[exercise.tracking_type]) {
    return exercise.tracking_type
  }

  const normalizedTitle = (exercise?.title || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  if (normalizedTitle.includes('jumping jack')) return 'jumping_jack'
  if (normalizedTitle.includes('squat')) return 'squat'
  if (normalizedTitle.includes('heel drop')) return 'heel_drop'
  if (normalizedTitle.includes('knie buig')) return 'knee_bend'
  if (normalizedTitle.includes('een been')) return 'single_leg_balance'

  return 'generic'
}

export const getTrackingDefinition = (trackingType) =>
  TRACKING_TYPES[trackingType] || TRACKING_TYPES.generic

export const parseDurationSeconds = (duration = '') => {
  const normalizedDuration = duration.toLowerCase().trim()
  const clockMatch = normalizedDuration.match(/^(\d+):(\d{1,2})$/)

  if (clockMatch) return (Number(clockMatch[1]) * 60) + Number(clockMatch[2])

  const value = Number.parseInt(normalizedDuration, 10)

  if (!Number.isFinite(value)) return 60
  if (normalizedDuration.includes('min')) return Math.max(5, value * 60)

  return Math.max(5, value)
}

export const parseRepetitionTarget = (repetitions = '') => {
  const value = Number.parseInt(repetitions, 10)
  return Number.isFinite(value) ? Math.max(1, value) : 10
}

export const evaluateExercisePose = (exercise, points) => {
  if (!points?.length) return notVisibleResult()

  const trackingType = getExerciseTrackingType(exercise)

  switch (trackingType) {
    case 'jumping_jack':
      return evaluateJumpingJack(points)
    case 'squat':
      return evaluateSquat(points)
    case 'heel_drop':
      return evaluateHeelDrop(points)
    case 'knee_bend':
      return evaluateKneeBend(points)
    case 'single_leg_balance':
      return evaluateSingleLegBalance(points)
    default:
      return evaluateGenericPose(points)
  }
}
