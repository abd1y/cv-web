import test from 'node:test'
import assert from 'node:assert/strict'
import { serializeResourcePayload } from './adminPayload.js'

test('project payload maps technology keys to IDs and keeps publication explicit', () => {
  const payload = serializeResourcePayload(
    'projects',
    {
      title: 'Project',
      slug: 'project',
      is_published: false,
      technologies: ['react'],
      cover: '',
    },
    null,
    { technologies: [{ id: 12, key: 'react' }], icons: [] },
  )

  assert.deepEqual(payload.technology_ids, [12])
  assert.equal(payload.is_published, false)
  assert.equal(payload.cover, undefined)
  assert.equal(payload.video, undefined)
  assert.equal(payload.github, undefined)
  assert.equal(payload.demo, undefined)
})

test('new project gets an internal slug automatically and keeps its external URL', () => {
  const lists = {
    projects: [{ id: 1, slug: 'my-project' }],
    technologies: [],
    icons: [],
  }
  const payload = serializeResourcePayload(
    'projects',
    { title: 'My Project', project_url: 'https://example.com', technologies: [] },
    null,
    lists,
  )

  assert.equal(payload.slug, 'my-project-2')
  assert.equal(payload.project_url, 'https://example.com')
})

test('skill payload preserves the selected custom or builtin icon relationship', () => {
  const lists = {
    technologies: [],
    icons: [{ id: 7, key: 'custom-mark' }],
  }
  const custom = serializeResourcePayload('skills', { name: 'Skill', icon_key: 'custom-mark' }, null, lists)
  const builtin = serializeResourcePayload('skills', { name: 'Skill', icon_key: 'react' }, null, lists)

  assert.equal(custom.icon, 7)
  assert.equal(custom.builtin_key, '')
  assert.equal(builtin.icon, null)
  assert.equal(builtin.builtin_key, 'react')
})

test('experience month values use the API date format', () => {
  const payload = serializeResourcePayload(
    'experience',
    { title: 'Role', company: 'Company', start: '2024-02', end: '' },
    null,
    { technologies: [], icons: [] },
  )

  assert.equal(payload.start_date, '2024-02-01')
  assert.equal(payload.end_date, null)
  assert.equal(payload.start, undefined)
  assert.equal(payload.end, undefined)
})
