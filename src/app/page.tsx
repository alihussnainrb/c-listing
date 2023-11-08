"use client";
import {
  Form,
  FormCalendar,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FileInput, Input } from "@/components/ui/input";
import { RadioGroupEl } from "@/components/ui/radio-group";
import formConfig from "@/config/form.cfg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PostListingSchema,
  postListingSchema,
} from "@/shared/validation/listing.z";
import { SelectEl } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UploadIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/spinner";
import addNewListing, {
  uploadListingFiles,
} from "@/server/actions/postListing";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const form = useForm<PostListingSchema>({
    resolver: zodResolver(postListingSchema),
    mode: "all",
    shouldFocusError: true,
  });
  const { toast } = useToast();

  // Check if mobility concerns is "Yes" so we can make required it's related fields
  const mobilityConcers =
    form.getValues("mobility.mobilityConcers")?.toLowerCase() === "yes";

  const handleSubmit = async (values: PostListingSchema) => {
    // Validating if mobilityConcerns is "Yes" so it's related fields are required
    if (mobilityConcers) {
      const mobilityDevicesValue = form.getValues(
        "mobility.usedMobilityDevices"
      );
      if (!mobilityDevicesValue || mobilityDevicesValue === "") {
        return form.setError(
          "mobility.usedMobilityDevices",
          {
            message: "Field Required!",
            type: "required",
          },
          { shouldFocus: true }
        );
      }
      const adjustWithOneFloorValue = form.getValues(
        "mobility.adjustWithOneFloor"
      );
      if (!adjustWithOneFloorValue || adjustWithOneFloorValue === "") {
        return form.setError(
          "mobility.adjustWithOneFloor",
          {
            message: "Field Required!",
            type: "required",
          },
          { shouldFocus: true }
        );
      }
    }
    let listingFiles = new FormData();
    if (values.teamContact.assessmentData) {
      values.teamContact.assessmentData.forEach((file) =>
        listingFiles.append("assessments", file)
      );
    }
    console.log(values.teamContact.assessmentData);
    const listing = await addNewListing({
      ...values,
      teamContact: {
        ...values.teamContact,
        assessmentData: [],
      },
    });
    if (!listing) {
      return toast({
        variant: "destructive",
        title:
          "Got some error while processing your request. Please try again.",
      });
    }
    const filesSaved = await uploadListingFiles(listing.id, listingFiles);
    if (!filesSaved) {
      return toast({
        variant: "destructive",
        title:
          "Got some error while processing your request. Please try again.",
      });
    }
    router.replace("/", { scroll: false });
    window.location.reload();
  };
  return (
    <main className="max-w-3xl mx-auto p-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} method="post">
          {/* Personal Information Section Start  */}
          <div>
            <div className="py-4 border-b border-gray-400">
              <h2 className="text-3xl font-bold">Personal Information</h2>
              <p className="text-sm mt-1">
                Please fill out as much information as possible. This will
                ensure placement is fast and efficient.
              </p>
            </div>
            <div className="space-y-10 py-4">
              <FormField
                control={form.control}
                name="waiverType.general"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {formConfig.waiverType.label}
                    </FormLabel>
                    <FormControl>
                      <RadioGroupEl
                        options={formConfig.waiverType.values.map((value) => ({
                          label: value,
                          value: value,
                        }))}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="waiverType.specific"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Specific Option</FormLabel>
                    <FormControl>
                      <SelectEl
                        value={field.value}
                        onChange={(opt) => field.onChange(opt?.value)}
                        options={formConfig.waiverTypeSpecific.values.map(
                          (value) => ({
                            label: value,
                            value: value,
                          })
                        )}
                        placeholder="Select"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{formConfig.timeframe.label}</FormLabel>
                    <FormControl>
                      <RadioGroupEl
                        options={formConfig.timeframe.values.map((value) => ({
                          label: value,
                          value: value,
                        }))}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="housingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {formConfig.housingType.label}
                    </FormLabel>
                    <FormControl>
                      <div>
                        <RadioGroupEl
                          options={formConfig.housingType.values.map(
                            (value) => ({
                              label: value,
                              value: value,
                            })
                          )}
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Full Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Date of Birth</FormLabel>
                    <FormControl>
                      <FormCalendar
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pmiNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>PMI Number</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Address Section Start */}
              <div>
                <div>
                  <Label className="text-xl font-bold">Address</Label>
                </div>
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="address.fullAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Full Address</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">City</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Postal / Zip Code
                        </FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {/* Address Section End */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="relegiousPref"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Religious & Cultural Preference(s)</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender Identity</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="race"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Race/Ethnicity</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="equipementsNeeded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {formConfig.equipementsNeeded.label}
                    </FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guardianStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {formConfig.guardianStatus.label}
                    </FormLabel>
                    <FormControl>
                      <div>
                        <RadioGroupEl
                          options={formConfig.guardianStatus.values.map(
                            (value) => ({
                              label: value,
                              value: value,
                            })
                          )}
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="livingSituation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {formConfig.livingSituation.label}
                    </FormLabel>
                    <FormControl>
                      <div>
                        <RadioGroupEl
                          options={formConfig.livingSituation.values.map(
                            (value) => ({
                              label: value,
                              value: value,
                            })
                          )}
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          {/* Personal Information Section End  */}
          {/* Mobility Section Start  */}
          <div>
            <div className="py-4 border-b border-gray-400">
              <h2 className="text-3xl font-bold">Mobility</h2>
              <p className="text-sm mt-1">{formConfig.mobility.description}</p>
            </div>
            <div className="space-y-10 py-4">
              <FormField
                control={form.control}
                name="mobility.mobilityConcers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {formConfig.mobility.qns.concerns.label}
                    </FormLabel>
                    <FormControl>
                      <RadioGroupEl
                        options={formConfig.mobility.qns.concerns.values.map(
                          (value) => ({
                            label: value,
                            value: value,
                          })
                        )}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobility.usedMobilityDevices"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required={mobilityConcers}>
                      {formConfig.mobility.qns.usedMobilityDevices.label}
                    </FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobility.adjustWithOneFloor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required={mobilityConcers}>
                      {formConfig.mobility.qns.adjustWithOneFloor.label}
                    </FormLabel>
                    <FormControl>
                      <RadioGroupEl
                        options={formConfig.mobility.qns.adjustWithOneFloor.values.map(
                          (value) => ({
                            label: value,
                            value: value,
                          })
                        )}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          {/* Mobility Section End  */}
          {/* Team Contact Section Start  */}
          <div>
            <div className="py-4 border-b border-gray-400">
              <h2 className="text-3xl font-bold">Team Contact</h2>
              <p className="text-sm mt-1">
                {formConfig.teamContact.description}
              </p>
            </div>
            <div className="space-y-10 py-4">
              <FormField
                control={form.control}
                name="teamContact.caseManager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {formConfig.teamContact.qns.caseManager.label}
                    </FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teamContact.referrer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {formConfig.teamContact.qns.referrer.label}
                    </FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teamContact.legalRepresentative"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {formConfig.teamContact.qns.legalRepresentative.label}
                    </FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teamContact.assessmentData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {formConfig.teamContact.qns.assessmentData.label}
                    </FormLabel>
                    <FormControl>
                      <div>
                        <FileInput
                          multiple
                          file={field.value}
                          onFileChange={field.onChange}
                        >
                          <div className="flex flex-col items-center justify-center p-10 rounded-md border-2 border-dashed border-slate-200">
                            {field.value && field.value.length > 0 ? (
                              <h5 className="text-lg font-medium">
                                {field.value.length} Files
                              </h5>
                            ) : (
                              <>
                                <UploadIcon className="w-8 h-8" />
                                <h5 className="text-lg font-medium">
                                  Browse Files
                                </h5>
                              </>
                            )}
                          </div>
                        </FileInput>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          {/* Team Contact Section End  */}
          <div className="flex items-center justify-end py-5">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
            >
              {form.formState.isSubmitting ? <Spinner /> : <span>Submit</span>}
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}