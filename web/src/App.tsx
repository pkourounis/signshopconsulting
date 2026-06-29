import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Portfolio from './pages/Portfolio'
import ShopDashboard from './pages/ShopDashboard'
import { getShop } from './lib/seed'

function Crumbs() {
  const loc = useLocation()
  const onShop = loc.pathname.startsWith('/shop/')
  return (
    <div className="crumbs">
      <Link to="/">Portfolio</Link>
      {onShop && <ShopCrumb />}
    </div>
  )
}

function ShopCrumb() {
  const m = useLocation().pathname.match(/\/shop\/(.+)$/)
  const shop = m ? getShop(m[1]) : undefined
  return <span> &nbsp;/&nbsp; {shop ? shop.name : 'Shop'}</span>
}

export default function App() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="logo">◧</div>
        <div>
          <h1>Sign Shop Consulting</h1>
          <div className="sub">CEO Performance Dashboard</div>
        </div>
        <div className="spacer" />
        <Crumbs />
        <div className="spacer" />
        <div className="who">
          Master view
          <span className="avatar">PK</span>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/shop/:id" element={<ShopDashboard />} />
      </Routes>
    </div>
  )
}
