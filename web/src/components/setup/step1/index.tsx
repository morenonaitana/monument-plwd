import 'react-phone-number-input/style.css';

import { Container, FormInputPhone, ImageSetter } from '@components';
import { UserRole } from '@enum';
import { yupResolver } from '@hookform/resolvers/yup';
import { ISetupStep } from '@interfaces';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useUserValidationSchema } from 'src/hooks/useUserValidationSchema';
import * as yup from 'yup';

type IFormUserInfo = yup.InferType<ReturnType<typeof useUserValidationSchema>>;

export const SetupStep1: React.FC<ISetupStep> = ({ nextStep, userData }) => {
  const userInfoSchema = useUserValidationSchema();
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IFormUserInfo>({
    defaultValues: {},
    resolver: yupResolver(userInfoSchema),
  });

  const onSubmit = (data: IFormUserInfo) => {
    setIsLoading(true);
    const newUser = {
      ...data,
      role: UserRole.PRIMARY_CARETAKER,
      auth0Id: userData.authenticatedUser?.sub,
      email: userData.authenticatedUser?.email,
    };

    fetch('/api/user', {
      method: 'POST',
      body: JSON.stringify({
        user: newUser,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        enqueueSnackbar('Profile created', {
          variant: 'success',
        });
        setIsLoading(false);
        nextStep();
      });
  };

  return (
    <Container>
      <form
        className="card m-auto w-[32rem] text-center p-8 bg-base-100 shadow-xl my-8"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="m-auto">
          <svg
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="card-title text-center mt-4 m-auto">My profile</h2>
        <p className="my-4">
          In order to complete your profile you must enter
          <br />
          some more information
        </p>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">First Name*</span>
          </label>
          <input
            {...register('firstName', { required: true })}
            className={`input input-bordered w-full ${
              errors.firstName ? 'input-error' : ''
            }`}
            placeholder="First Name"
            type="text"
          />
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Last Name*</span>
          </label>
          <input
            {...register('lastName', { required: true })}
            className={`input input-bordered w-full ${
              errors.lastName ? 'input-error' : ''
            }`}
            placeholder="First Name"
            type="text"
          />
        </div>
        <FormInputPhone control={control} errors={errors} />
        <div className="mt-2">
          <Controller
            control={control}
            name="picture"
            render={({ field: { value, onChange } }) => (
              <ImageSetter
                base64image={value}
                label="Upload avatar (optional)"
                setBase64Image={(base64) => {
                  onChange(base64);
                }}
              />
            )}
          />
        </div>
        <button
          className={`w-40 mt-8 m-auto btn btn-secondary ${
            isLoading ? 'btn-loading' : ''
          }`}
          type="submit"
        >
          Continue
        </button>
      </form>
    </Container>
  );
};