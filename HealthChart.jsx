import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export default function HealthChart({ data }) {
  return (
    <LineChart width={400} height={200} data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="weight" stroke="#8884d8" />
    </LineChart>
  );
}
