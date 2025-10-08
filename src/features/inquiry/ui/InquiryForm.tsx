"use client";

import Image from "next/image";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import {
  postEmail,
  postEmailCode,
  verifyEmailCode,
} from "@/shared/services/inquiry";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import type { ModalStatus } from "@/types";
import { AlertModal } from "@/widgets/alert-modal";
import { inquiryFormRezolver, type InquiryFormValues } from "../model/schema";

export default function InquiryForm() {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [modalOpen, setModalOpen] = useState<ModalStatus | null>(null);
  const [emailSubject, setEmailSubject] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: inquiryFormRezolver,
    defaultValues: {
      message: "",
      email: "",
      code: "",
      isVerified: false,
      name: "",
      subject: "",
    },
  });
  const formValues = watch();

  const isEmpty = Object.values(formValues).some(
    (value) => value === "" || value == null || value === false,
  );
  const isDisabled = Object.keys(errors).length > 0 || isEmpty;

  const handleClickVerify = async () => {
    const email = formValues.email;

    try {
      const isValid = await trigger("email");

      if (!isValid) {
        return;
      }

      await postEmailCode(email);
      setIsCodeSent(true);
    } catch {
      setIsCodeSent(false);
    }
  };

  const handleCheckCode = async () => {
    const { email, code } = formValues;

    if (!code || !email) return;

    try {
      await verifyEmailCode({ email, code });
      setValue("isVerified", true);
    } catch {
      setError("code", {
        message: "Code is incorrect, Please check again.",
      });
    }
  };

  const handleSelectSubject = (value: string) => {
    setEmailSubject(value);
  };

  const handleOpen = (type: string) => (open: boolean) => {
    setModalOpen({
      type,
      open,
    });
  };

  const onSubmit: SubmitHandler<InquiryFormValues> = async (data) => {
    try {
      const { message, name, subject } = data;

      await postEmail({
        to: "seoulmomenttw@gmail.com",
        html: message,
        name,
        subject,
      });
      setModalOpen({
        type: "success",
        open: true,
      });
    } catch {
      setModalOpen({
        type: "error",
        open: true,
      });
    }
  };

  return (
    <>
      <form
        className="flex flex-col gap-[40px]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-[20px]">
          <div>
            <Input
              className="h-[48px]"
              placeholder="Your Name"
              {...register("name")}
            />
            {errors.name && (
              <span className="text-error">{errors.name.message}</span>
            )}
          </div>
          <div>
            <div className="flex h-[48px] gap-[8px]">
              <Input
                placeholder="Please enter your email"
                {...register("email")}
              />
              <Button
                className="h-[48px] w-[68px] font-semibold"
                disabled={isCodeSent}
                onClick={handleClickVerify}
                type="button"
              >
                인증
              </Button>
            </div>
            {errors.email && (
              <span className="text-error">{errors.email.message}</span>
            )}
            {isCodeSent && (
              <span className="text-sent">
                Verification code has been sent.
              </span>
            )}
          </div>
          {isCodeSent && (
            <>
              <div className="flex flex-col gap-[8px]">
                <div className="flex h-[48px] gap-[8px]">
                  <Input
                    placeholder="Please enter the verification code"
                    {...register("code")}
                  />
                  <Button
                    className="h-[48px] whitespace-pre"
                    disabled={!formValues.code || formValues.isVerified}
                    onClick={handleCheckCode}
                    type="button"
                  >
                    {formValues.isVerified ? "Verified" : "Confirm"}
                  </Button>
                </div>
                {!formValues.isVerified && errors.code && (
                  <span className="text-error">{errors.code.message}</span>
                )}
                {formValues.isVerified && (
                  <span className="text-sent">
                    Email verified successfully.
                  </span>
                )}
              </div>
            </>
          )}
          <div>
            <div className="flex h-[48px] gap-[8px]">
              <Select onValueChange={handleSelectSubject} value={emailSubject}>
                <SelectTrigger className="h-full max-w-[150px]">
                  {emailSubject.length === 0 ? "선택" : emailSubject}
                </SelectTrigger>
                <SelectContent className="w-[150px]">
                  <SelectItem value="제휴문의">제휴문의</SelectItem>
                  <SelectItem value="입점문의">입점문의</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
              <Input
                {...register("subject")}
                disabled={emailSubject !== "기타"}
              />
            </div>
            {errors.subject && (
              <span className="text-error">{errors.subject.message}</span>
            )}
          </div>
          <div>
            <Textarea
              className="h-[100px] resize-none"
              placeholder="Write your message(30 characters)"
              {...register("message")}
            />
            {errors.message && (
              <span className="text-error">{errors.message.message}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-[10px]">
          <Button
            className="h-auto w-full px-[20px] py-[16px]"
            disabled={isDisabled}
            type="submit"
          >
            Send Message
          </Button>
          <p className="text-body-3 max-sm:text-body-5 text-black/40">
            Protected by reCAPTCHA. Google Privacy Policy and Terms apply. By
            submitting, you agree to our use of your data to respond to your
            inquiry.
          </p>
        </div>
      </form>
      {modalOpen?.type === "success" && (
        <AlertModal
          onClickOK={() => {
            handleOpen("success")(false);
            reset();
            setIsCodeSent(false);
          }}
          onOpenChange={handleOpen("success")}
          open={modalOpen?.open}
        >
          <div className="flex flex-col items-center justify-center gap-[24px]">
            <Image alt="" height={40} src="/alert_complete.svg" width={40} />
            <p className="text-center">
              Your message has been sent <br />
              successfully. Thank you.
            </p>
          </div>
        </AlertModal>
      )}
      {modalOpen?.type === "error" && (
        <AlertModal
          onClickOK={() => handleOpen("error")(false)}
          onOpenChange={handleOpen("error")}
          open={modalOpen?.open}
        >
          <div className="flex flex-col items-center justify-center gap-[24px]">
            <Image alt="" height={40} src="/alert_error.svg" width={40} />
            <p className="text-center">
              An error occurred while sending.
              <br />
              Please try again later.
            </p>
          </div>
        </AlertModal>
      )}
    </>
  );
}
