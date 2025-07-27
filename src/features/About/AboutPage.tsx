import { useEffect } from 'react';

function AboutPage() {
  useEffect(() => {
    console.log('AboutPage');
  }, []);

  return <div>AboutPage</div>;
}

export default AboutPage;
