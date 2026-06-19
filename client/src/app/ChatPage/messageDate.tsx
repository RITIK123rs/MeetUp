export default function MessageDate({date}:{ date: Date }) {
  return (
    <div className="dateDivider">
      <span>{new Date(date).toLocaleDateString("en-IN",{
        weekday: "long",
        day: "numeric",
        month: "long",
        year:"numeric",
      })}</span>
    </div>
  );
}
