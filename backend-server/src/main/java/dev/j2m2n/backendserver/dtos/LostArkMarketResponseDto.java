package dev.j2m2n.backendserver.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class LostArkMarketResponseDto {

    @JsonProperty("PageNo")
    private Integer pageNo;

    @JsonProperty("PageSize")
    private Integer pageSize;

    @JsonProperty("TotalCount")
    private Integer totalCount;

    @JsonProperty("Items")
    private List<LostArkMarketItemDto> items; // 여기가 핵심입니다.
}