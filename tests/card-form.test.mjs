import assert from "node:assert/strict";
import test from "node:test";
import { servicesFromForm } from "../src/lib/card-form.ts";
import { assertCardUploadLimit, exceedsCardUploadLimit, MAX_CARD_UPLOAD_BYTES } from "../src/lib/upload-limits.ts";

const shouldNotUpload = async () => assert.fail("No image should be uploaded");

test("removing every service clears names and images even when old images exist", async () => {
  const form = new FormData();
  form.set("servicesEditor", "1");
  const result = await servicesFromForm(form, shouldNotUpload, [{ name: "Ancien service", imageUrl: "/old.jpg" }]);
  assert.deepEqual(result, { services: [], serviceImages: [] });
});

test("legacy textarea submissions retain existing image associations", async () => {
  const form = new FormData();
  form.set("services", " Sécurité humaine\nMobilité ; Facilities ");
  const images = [{ name: "Mobilité", imageUrl: "/mobility.jpg" }];
  const result = await servicesFromForm(form, shouldNotUpload, images);
  assert.deepEqual(result, { services: ["Sécurité humaine", "Mobilité", "Facilities"], serviceImages: images });
});

test("remaining service keys keep the correct images after another row is removed", async () => {
  const form = new FormData();
  form.set("servicesEditor", "1");
  form.append("serviceKey", "2");
  form.append("serviceKey", "7");
  form.set("serviceName-2", "Mobilité");
  form.set("serviceImageUrl-2", "/mobility.jpg");
  form.set("serviceName-7", "Facilities");
  form.set("serviceImageUrl-7", "/facilities.jpg");
  const result = await servicesFromForm(form, shouldNotUpload);
  assert.deepEqual(result, {
    services: ["Mobilité", "Facilities"],
    serviceImages: [
      { name: "Mobilité", imageUrl: "/mobility.jpg" },
      { name: "Facilities", imageUrl: "/facilities.jpg" }
    ]
  });
});

test("upload replaces a service URL and follows its edited name", async () => {
  const form = new FormData();
  form.set("servicesEditor", "1");
  form.append("serviceKey", "3");
  form.set("serviceName-3", " Nouveau nom ");
  form.set("serviceImageUrl-3", "/previous.jpg");
  form.set("serviceImageFile-3", new File(["image"], "service.png", { type: "image/png" }));
  let uploads = 0;
  const result = await servicesFromForm(form, async (file) => {
    uploads++;
    assert.equal(file.name, "service.png");
    return "/uploads/new.png";
  });
  assert.equal(uploads, 1);
  assert.deepEqual(result.serviceImages, [{ name: "Nouveau nom", imageUrl: "/uploads/new.png" }]);
});

test("combined image limit allows exactly 4 MiB and rejects one byte more", () => {
  assert.equal(exceedsCardUploadLimit([]), false);
  assert.equal(exceedsCardUploadLimit([{ size: MAX_CARD_UPLOAD_BYTES / 2 }, { size: MAX_CARD_UPLOAD_BYTES / 2 }]), false);
  const form = new FormData();
  form.set("photoFile", new File([new Uint8Array(MAX_CARD_UPLOAD_BYTES / 2)], "photo.jpg"));
  form.set("coverFile", new File([new Uint8Array(MAX_CARD_UPLOAD_BYTES / 2)], "cover.jpg"));
  assert.doesNotThrow(() => assertCardUploadLimit(form));
  form.set("serviceImageFile-0", new File([new Uint8Array(1)], "service.jpg"));
  assert.throws(() => assertCardUploadLimit(form), /4 Mo au total/);
  form.delete("coverFile");
  assert.doesNotThrow(() => assertCardUploadLimit(form));
});
