"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

export default function InquiryForm() {
  return (
    <form className="flex flex-col gap-[40px]">
      <div className="flex flex-col gap-[20px]">
        <Input className="h-[48px]" placeholder="Your Name" />
        <div className="flex h-[48px] gap-[8px]">
          <Input placeholder="Please enter your email" />
          <Button className="h-[48px] w-[68px] font-semibold">인증</Button>
        </div>
        <div className="flex h-[48px] gap-[8px]">
          <Select>
            <SelectTrigger className="h-full max-w-[150px]">선택</SelectTrigger>
            <SelectContent className="w-[150px]">
              <SelectItem value="제휴문의">제휴문의</SelectItem>
              <SelectItem value="입점문의">입점문의</SelectItem>
              <SelectItem value="기타">기타</SelectItem>
            </SelectContent>
          </Select>
          <Input disabled />
        </div>
        <Textarea
          className="h-[100px] resize-none"
          placeholder="Write your message(30 characters)"
        />
      </div>
      <div className="flex flex-col gap-[10px]">
        <Button className="h-auto w-full px-[20px] py-[16px]" disabled>
          Send Message
        </Button>
        <p className="text-body-3 max-sm:text-body-5 text-black/40">
          Protected by reCAPTCHA. Google Privacy Policy and Terms apply. By
          submitting, you agree to our use of your data to respond to your
          inquiry.
        </p>
      </div>
    </form>
  );
}
