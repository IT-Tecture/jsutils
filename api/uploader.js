(function(ns) {
    var Uploader = function(uploadPath, controls) {
        var _self = this;

        this.uploadPath = uploadPath;
        this.controls = controls;
        this.isUploadInProgress = false;

        this.dispatchEvent = function(event) {
            $(this).trigger(event, [].slice.call(arguments, 1));
        };

        this.reset = function() {
            this.controls.file.prop("disabled", false);
            this.controls.trigger.removeClass("disabled uploader-in-progress uploader-processing");
            this.isUploadInProgress = false;
        };

        this.controls.file
            .on("change", function() {
                _self.upload(this.files);
            });

        this.controls.trigger.on("click", function() {
            // only trigger the click event manually if the users browser is firefox between versions 3.6 and 21
            if(/Firefox\/(3\.6(\.\d+)?|[4-9]\.0(\.\d+)?|1[0-9]\.0(\.\d+)?|2[0-1]\.0(\.\d+)?)$/i.test(navigator.userAgent)) {
                $("#" + $(this).attr("for")).trigger("click");
            }
        });
    };

    Uploader.prototype = {
        on: function(event, listener) {
            $(this).on(event, listener);
            return this;
        },
        upload: function(files) {
            if(this.isUploadInProgress) return;

            var _self = this;

            this.isUploadInProgress = true;
            this.dispatchEvent("uploader:start");

            var formData = new FormData();
            for(var i = 0, ii = files.length; i < ii; i++) {
                formData.append("file-" + i, files[i]);
            }

            $.ajax(this.uploadPath, {
                type: "POST",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                xhr: function() {
                    var xhr = new window.XMLHttpRequest();

                    xhr.upload.addEventListener("progress", function(event) {
                        if(event.lengthComputable) {
                            var progress = Math.ceil(event.loaded / event.total * 100);
                            _self.controls.progress.css("width", progress + "%");

                            if(progress === 100) {
                                _self.dispatchEvent("uploader:processing");
                            }
                        }
                    });

                    return xhr;
                }
            }).complete(function() {
                _self.dispatchEvent("uploader:complete");
                _self.reset();
            });

            this.controls.file.prop("disabled", true);
            this.controls.trigger.addClass("uploader-in-progress");
        }
    };

    ns.Uploader = Uploader;
})(org.farbdev.api);
