// Centers the mobile-web app inside a phone mock on larger screens,
// and goes full-bleed on actual phones.
export default function PhoneFrame({ children }) {
  return (
    <div className="stage">
      <div className="phone">
        <div className="phone-screen">{children}</div>
      </div>
    </div>
  )
}
