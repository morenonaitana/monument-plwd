import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { Container, FormInputPhone, Header } from '@components';
import { LayoutWithAppContext } from '@components/layouts/LayoutWithAppContext';
import { UserRole } from '@enum';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { ReactElement, useEffect, useState } from 'react';
import Autocomplete from 'react-google-autocomplete';
import { Controller, useForm } from 'react-hook-form';
import { useAppUserContext } from 'src/hooks/useAppUserContext';
import { usePermissions } from 'src/hooks/usePermissions';
import { usePlwdValidationSchema } from 'src/hooks/usePlwdValidationSchema';
import * as yup from 'yup';

type IFormPlwdInfo = yup.InferType<ReturnType<typeof usePlwdValidationSchema>>;

export const getServerSideProps = withPageAuthRequired();

const Profile = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user, plwd } = useAppUserContext();
  const { canManageCarecircle } = usePermissions();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const plwdInfoSchema = usePlwdValidationSchema();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IFormPlwdInfo>({
    defaultValues: {
      address: plwd.address,
      email: plwd.email,
      firstName: plwd.firstName,
      lastName: plwd.lastName,
      phone: plwd.phone,
    },
    resolver: yupResolver(plwdInfoSchema),
  });

  const onSubmit = (data: IFormPlwdInfo) => {
    const updatedUser = {
      ...data,
      id: plwd.id,
    };
    setIsLoading(true);
    fetch(`/api/plwd/${updatedUser.id}`, {
      method: 'PATCH',
      body: JSON.stringify(updatedUser),
    })
      .then((res) => res.json())
      .then(() => {
        enqueueSnackbar('Updated', {
          variant: 'success',
        });
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!canManageCarecircle) {
      router.push(`/plwd/${plwd.id}`);
    }
  }, [canManageCarecircle, router, plwd.id]);

  if (!canManageCarecircle) return null;

  return (
    <Container>
      <Header tabTitle="Monument - Profile" />
      <div className="max-w-md m-auto">
        <div className="card w-full p-8 bg-base-100 shadow-xl">
          <h2 className="card-title mb-2">User Info</h2>
          <p>
            {user.firstName} {user.lastName}
          </p>
          {plwd.caretakerId === user.id ? (
            <p>Role: Primary Caretaker</p>
          ) : (
            <p>
              Role:{' '}
              {user.role === UserRole.ADMIN ? 'Admin' : 'Carecircle member'}
            </p>
          )}
        </div>
        <form
          className="card w-full p-8 bg-base-100 shadow-xl my-8"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="card-title mb-2 mt-8">PLWD Info</h2>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">First Name</span>
            </label>
            <input
              {...register('firstName', { required: true })}
              className={`input input-bordered w-96 ${
                errors.firstName ? 'input-error' : ''
              }`}
              placeholder="First Name"
              type="text"
            />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Last Name</span>
            </label>
            <input
              {...register('lastName', { required: true })}
              className={`input input-bordered w-96 ${
                errors.lastName ? 'input-error' : ''
              }`}
              placeholder="First Name"
              type="text"
            />
          </div>
          <FormInputPhone control={control} errors={errors} />
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              {...register('email', { required: true })}
              className={`input input-bordered w-96 ${
                errors.email ? 'input-error' : ''
              }`}
              placeholder="Email"
              type="text"
            />
          </div>
          <div className="form-control w-full mb-8">
            <label className="label">
              <span className="label-text">Address</span>
            </label>
            <Controller
              control={control}
              name="address"
              render={({ field: { value, onChange } }) => (
                <Autocomplete
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                  className={`input input-bordered w-full ${
                    errors.address ? 'input-error' : ''
                  }`}
                  defaultValue={value?.description}
                  language="en"
                  onPlaceSelected={(place: any) => {
                    onChange({
                      description: place.formatted_address,
                      geometry: {
                        location: {
                          lat: place.geometry.location.lat(),
                          lng: place.geometry.location.lng(),
                        },
                      },
                    });
                  }}
                  options={{
                    types: ['address'],
                  }}
                />
              )}
              rules={{ required: true }}
            />
          </div>
          <button
            className={`w-40 m-auto btn btn-secondary ${
              isLoading ? 'btn-loading' : ''
            }`}
            type="submit"
          >
            Save
          </button>
        </form>
      </div>
    </Container>
  );
};

Profile.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithAppContext>{page}</LayoutWithAppContext>;
};

export default Profile;