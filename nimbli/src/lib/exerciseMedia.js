import heelDrop from '../assets/images/heel-drop.png'
import jumpingJacks from '../assets/images/jumping-jacks.png'
import kneeBend from '../assets/images/knee-bend.png'
import oneLeg from '../assets/images/one-leg.png'
import squat from '../assets/images/squat.png'

const normalizeTitle = (title = '') =>
    title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()

const localExerciseCovers = {
    'heel drop': heelDrop,
    'jumping jacks': jumpingJacks,
    'knie buigen': kneeBend,
    'op een been staan': oneLeg,
    squat,
    squats: squat,
}

export function getExerciseCover(exercise) {
    if (!exercise) return null

    return exercise.cover_image || localExerciseCovers[normalizeTitle(exercise.title)] || null
}
