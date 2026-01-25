const KPICard = ({ title, value, color }) => (
  <div className={`p-4 bg-white rounded-lg shadow-md border-l-4 ${color}`}>
    <h3 className="text-gray-500 text-sm font-medium uppercase">{title}</h3>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

export default KPICard;
