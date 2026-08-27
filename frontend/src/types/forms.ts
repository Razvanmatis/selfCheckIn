export type GuestLookupForm = {
  firstName: string;
  lastName: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
};

export type DefineKeypadCodeRequest = GuestLookupForm & {
  pinCode: string;
  language?: string;
};


