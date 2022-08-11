import { UserProfile, withPageAuthRequired } from '@auth0/nextjs-auth0';
import {
  Container,
  Header,
  SetupStep1,
  SetupStep2,
  SetupStep3,
} from '@components';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { useCurrentUser } from 'src/hooks/useCurrentUser';
import { mutate } from 'swr';

type Props = { user: UserProfile };
export const getServerSideProps = withPageAuthRequired();

const Setup = ({ user: authenticatedUser }: Props) => {
  const [step, setStep] = useState(1);

  const router = useRouter();

  const getUserData = async () => {
    await mutate(`/api/user/${authenticatedUser.sub}`);
  };

  // Goto next step with usecallback
  const nextStep = useCallback(() => {
    if (step === 3) {
      router.push('/');
    } else {
      getUserData();
      setStep(step + 1);
    }
  }, [router, step]);

  const {
    data: currentUser,
    error: currentUserError,
    loading: isLoadingCurrentUser,
  } = useCurrentUser(authenticatedUser.sub);

  const userData = {
    currentUser,
    authenticatedUser,
  };

  // Go to step
  const goToStep = (step: number) => {
    setStep(step);
  };

  useEffect(() => {
    if (currentUser?.id && currentUser?.hasCompletedOnboarding) {
      goToStep(3);
    }
    if (step === 1 && currentUser?.id) {
      goToStep(2);
    }
  }, [step, currentUser, nextStep]);

  // Check which step and return step component
  const getStep = () => {
    switch (step) {
      case 1:
        return <SetupStep1 nextStep={nextStep} userData={userData} />;
      case 2:
        return <SetupStep2 nextStep={nextStep} userData={userData} />;
      case 3:
        return <SetupStep3 nextStep={nextStep} userData={userData} />;
      default:
        return <SetupStep1 nextStep={nextStep} userData={userData} />;
    }
  };

  return (
    <Container>
      <Header isPublic={true} tabTitle="Monument - Setup" />
      <ul className="steps w-[32rem] pb-4 m-auto">
        <li className="step step-secondary">My profile</li>
        <li className={`step ${step > 1 ? 'step-secondary' : ''}`}>
          PLWD details
        </li>
        <li className={`step ${step > 2 ? 'step-secondary' : ''}`}>
          Watch setup
        </li>
      </ul>
      {getStep()}
    </Container>
  );
};

export default Setup;