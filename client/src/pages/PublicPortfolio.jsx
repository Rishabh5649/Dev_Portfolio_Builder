import { useParams } from 'react-router-dom';

const PublicPortfolio = () => {
  const { slug } = useParams();

  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold">Public Portfolio: {slug}</h1>
      <p className="mt-4">This simulates the public live view of the portfolio.</p>
    </div>
  );
};

export default PublicPortfolio;
