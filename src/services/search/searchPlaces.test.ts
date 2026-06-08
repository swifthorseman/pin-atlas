import { describe, it, expect } from 'vitest'
import { searchPlaces } from './searchPlaces'
import type { Place } from '../../domain/Place'
import places from '../../data/countries/ch/places.json'

const dataset = places as Place[]

function topId(query: string): string | undefined {
  return searchPlaces(query, dataset)[0]?.id
}

function ids(query: string): string[] {
  return searchPlaces(query, dataset).map((p) => p.id)
}

describe('searchPlaces', () => {
  it('returns nothing for a blank query', () => {
    expect(searchPlaces('', dataset)).toEqual([])
    expect(searchPlaces('   ', dataset)).toEqual([])
  })

  describe('exact-name match', () => {
    it.each([
      ['Bern', 'ch:place:2661552'],
      ['Interlaken', 'ch:place:2660253'],
      ['Zermatt', 'ch:place:2657928'],
      ['Gimmelwald', 'ch:place:2660611'],
    ])('resolves %s', (query, id) => {
      expect(topId(query)).toBe(id)
    })
  })

  describe('alias and accent-insensitive match', () => {
    it('resolves Murren to Mürren', () => {
      expect(topId('Murren')).toBe('ch:place:2659530')
    })

    it('resolves Almenhubel to Allmendhubel', () => {
      expect(topId('Almenhubel')).toBe('ch:place:6935302')
    })
  })

  describe('multi-name places resolve to one ID', () => {
    it.each([
      ['Luzern', 'ch:place:2659811'],
      ['Lucerne', 'ch:place:2659811'],
    ])('%s', (query, id) => {
      expect(topId(query)).toBe(id)
    })

    it.each([
      ['Murten', 'ch:place:2659529'],
      ['Morat', 'ch:place:2659529'],
    ])('%s', (query, id) => {
      expect(topId(query)).toBe(id)
    })

    it.each([
      ['Geneva', 'ch:place:2660646'],
      ['Genève', 'ch:place:2660646'],
      ['Genf', 'ch:place:2660646'],
      ['Ginevra', 'ch:place:2660646'],
    ])('%s', (query, id) => {
      expect(topId(query)).toBe(id)
    })
  })

  describe('similar names are not confused', () => {
    it('suggests Grindelwald for Grindlewald', () => {
      expect(topId('Grindlewald')).toBe('ch:place:2660498')
    })

    it('never matches Gimmelwald for Grindlewald', () => {
      expect(ids('Grindlewald')).not.toContain('ch:place:2660611')
    })
  })
})
