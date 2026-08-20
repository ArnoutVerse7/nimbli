import heelDrop from '../assets/images/heel-drop.png'
import jumpingJacks from '../assets/images/jumping-jacks.png'
import kneeBend from '../assets/images/knee-bend.png'
import oneLeg from '../assets/images/one-leg.png'
import squat from '../assets/images/squat.png'
import { supabase } from './supabase'

const exerciseMediaBucket = 'exercise-videos'

const normalizeTitle = (title = '') =>
    title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()

export const noExerciseCoverReference = 'local:none'

const localExerciseCovers = {
    'heel drop': { reference: 'local:heel-drop', source: heelDrop },
    'jumping jacks': { reference: 'local:jumping-jacks', source: jumpingJacks },
    'knie buigen': { reference: 'local:knee-bend', source: kneeBend },
    'op een been staan': { reference: 'local:one-leg', source: oneLeg },
    squat: { reference: 'local:squat', source: squat },
    squats: { reference: 'local:squat', source: squat },
}

const localCoversByReference = Object.values(localExerciseCovers).reduce(
    (covers, cover) => ({ ...covers, [cover.reference]: cover.source }),
    {}
)

const findLocalCover = (title) => {
    const normalizedTitle = normalizeTitle(title)

    return Object.entries(localExerciseCovers).find(([knownTitle]) =>
        normalizedTitle === knownTitle || normalizedTitle.startsWith(`${knownTitle} `)
    )?.[1] || null
}

export function getExerciseCover(exercise) {
    if (!exercise) return null

    if (exercise.cover_image === noExerciseCoverReference) return null

    return localCoversByReference[exercise.cover_image]
        || exercise.cover_image
        || findLocalCover(exercise.title)?.source
        || null
}

export function getExerciseCoverReference(exercise) {
    if (!exercise) return null

    return exercise.cover_image || findLocalCover(exercise.title)?.reference || null
}

export async function uploadExerciseMedia(file, folderName) {
    if (!file) return null

    const fileExtension = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
    const filePath = `${folderName}/${fileName}`

    const { error } = await supabase.storage
        .from(exerciseMediaBucket)
        .upload(filePath, file)

    if (error) throw error

    const { data } = supabase.storage
        .from(exerciseMediaBucket)
        .getPublicUrl(filePath)

    return data.publicUrl
}

export async function removeExerciseMediaByUrl(publicUrl) {
    if (!publicUrl) return

    const publicPathMarker = `/storage/v1/object/public/${exerciseMediaBucket}/`
    const encodedPath = publicUrl.split(publicPathMarker)[1]?.split('?')[0]

    if (!encodedPath) return

    const { error } = await supabase.storage
        .from(exerciseMediaBucket)
        .remove([decodeURIComponent(encodedPath)])

    if (error) throw error
}
