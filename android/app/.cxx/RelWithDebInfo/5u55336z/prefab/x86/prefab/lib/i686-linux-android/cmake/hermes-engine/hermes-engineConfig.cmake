if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/Users/abhishekmishra/.gradle/caches/9.4.1/transforms/4b9dfa67d544cdb61450245f5f477b28/transformed/hermes-android-250829098.0.17-release/prefab/modules/hermesvm/libs/android.x86/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/abhishekmishra/.gradle/caches/9.4.1/transforms/4b9dfa67d544cdb61450245f5f477b28/transformed/hermes-android-250829098.0.17-release/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

