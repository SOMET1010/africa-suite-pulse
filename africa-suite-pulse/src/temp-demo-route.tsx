import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AfricanThemeDemo from '@/pages/AfricanThemeDemo'

export function TempDemoRoute() {
  return (
    <Routes>
      <Route path="/african-demo" element={<AfricanThemeDemo />} />
    </Routes>
  )
}
